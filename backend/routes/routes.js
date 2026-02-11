const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');
const RouteOptimizer = require('../utils/RouteOptimizer');

/**
 * POST /api/routes/optimize
 * Calculate optimal route for a driver's deliveries
 */
router.post('/optimize', async (req, res) => {
    try {
        const { driverId, date } = req.body;

        if (!driverId) {
            return res.status(400).json({
                success: false,
                message: 'Driver ID is required'
            });
        }

        // Get driver
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Get deliveries for this driver
        const query = {
            driverId,
            status: { $in: ['Out for Delivery', 'Pending'] }
        };

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: startDate, $lte: endDate };
        }

        const deliveries = await Delivery.find(query).populate('customerId');

        if (deliveries.length === 0) {
            return res.json({
                success: true,
                message: 'No deliveries to optimize',
                optimizedRoute: [],
                totalDistance: 0,
                estimatedTime: 0
            });
        }

        // Optimize route
        const startLocation = driver.location || null;
        const result = RouteOptimizer.optimizeRoute(deliveries, startLocation);

        if (!result.success) {
            return res.status(400).json(result);
        }

        // Update deliveries with route sequence and estimated arrival
        const updatePromises = result.optimizedRoute.map((delivery, index) => {
            return Delivery.findByIdAndUpdate(
                delivery._id,
                {
                    routeSequence: delivery.sequence,
                    estimatedArrival: delivery.estimatedArrival
                },
                { new: true }
            );
        });

        await Promise.all(updatePromises);

        // Get turn-by-turn directions
        const directions = RouteOptimizer.getTurnByTurnDirections(result.optimizedRoute);

        // Emit socket event to driver
        if (req.io) {
            req.io.to(`driver_${driverId}`).emit('route:optimized', {
                driverId,
                route: result.optimizedRoute,
                directions,
                totalDistance: result.totalDistance,
                estimatedTime: result.estimatedTime,
                efficiency: result.efficiency,
                timestamp: new Date()
            });

            // Also emit to admins
            req.io.to('admins').emit('route:optimized', {
                driverId,
                driverName: driver.name,
                route: result.optimizedRoute,
                totalDistance: result.totalDistance,
                estimatedTime: result.estimatedTime,
                efficiency: result.efficiency,
                timestamp: new Date()
            });
        }

        res.json({
            success: true,
            ...result,
            directions,
            driver: {
                id: driver._id,
                name: driver.name,
                truckNo: driver.truckNo
            }
        });

    } catch (error) {
        console.error('Error optimizing route:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to optimize route',
            error: error.message
        });
    }
});

/**
 * GET /api/routes/driver/:driverId
 * Get current optimized route for a driver
 */
router.get('/driver/:driverId', async (req, res) => {
    try {
        const { driverId } = req.params;

        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Get deliveries with route sequence
        const deliveries = await Delivery.find({
            driverId,
            status: { $in: ['Out for Delivery', 'Pending'] },
            routeSequence: { $gt: 0 }
        })
            .populate('customerId')
            .sort({ routeSequence: 1 });

        if (deliveries.length === 0) {
            return res.json({
                success: true,
                message: 'No active route',
                route: [],
                totalDistance: 0,
                estimatedTime: 0
            });
        }

        // Calculate total distance
        let totalDistance = 0;
        for (let i = 0; i < deliveries.length - 1; i++) {
            if (deliveries[i].coordinates && deliveries[i + 1].coordinates) {
                totalDistance += RouteOptimizer.calculateDistance(
                    deliveries[i].coordinates,
                    deliveries[i + 1].coordinates
                );
            }
        }

        // Get directions
        const directions = RouteOptimizer.getTurnByTurnDirections(deliveries);

        res.json({
            success: true,
            route: deliveries,
            directions,
            totalDistance: Math.round(totalDistance * 100) / 100,
            estimatedTime: deliveries.length * 10 + Math.round((totalDistance / 30) * 60),
            driver: {
                id: driver._id,
                name: driver.name,
                truckNo: driver.truckNo,
                currentLocation: driver.location
            }
        });

    } catch (error) {
        console.error('Error getting driver route:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get driver route',
            error: error.message
        });
    }
});

/**
 * POST /api/routes/recalculate/:driverId
 * Recalculate route for a driver (when deliveries added/removed/completed)
 */
router.post('/recalculate/:driverId', async (req, res) => {
    try {
        const { driverId } = req.params;
        const { reason } = req.body;

        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Get remaining deliveries
        const deliveries = await Delivery.find({
            driverId,
            status: { $in: ['Out for Delivery', 'Pending'] }
        }).populate('customerId');

        if (deliveries.length === 0) {
            return res.json({
                success: true,
                message: 'No deliveries to recalculate',
                optimizedRoute: [],
                totalDistance: 0,
                estimatedTime: 0
            });
        }

        // Use driver's current location as start point
        const startLocation = driver.location || null;
        const result = RouteOptimizer.optimizeRoute(deliveries, startLocation);

        if (!result.success) {
            return res.status(400).json(result);
        }

        // Update deliveries
        const updatePromises = result.optimizedRoute.map((delivery) => {
            return Delivery.findByIdAndUpdate(
                delivery._id,
                {
                    routeSequence: delivery.sequence,
                    estimatedArrival: delivery.estimatedArrival
                },
                { new: true }
            );
        });

        await Promise.all(updatePromises);

        const directions = RouteOptimizer.getTurnByTurnDirections(result.optimizedRoute);

        // Emit socket event
        if (req.io) {
            req.io.to(`driver_${driverId}`).emit('route:recalculated', {
                driverId,
                route: result.optimizedRoute,
                directions,
                totalDistance: result.totalDistance,
                estimatedTime: result.estimatedTime,
                efficiency: result.efficiency,
                reason: reason || 'Route recalculated',
                timestamp: new Date()
            });

            req.io.to('admins').emit('route:recalculated', {
                driverId,
                driverName: driver.name,
                route: result.optimizedRoute,
                totalDistance: result.totalDistance,
                estimatedTime: result.estimatedTime,
                efficiency: result.efficiency,
                reason: reason || 'Route recalculated',
                timestamp: new Date()
            });
        }

        res.json({
            success: true,
            ...result,
            directions,
            reason: reason || 'Route recalculated'
        });

    } catch (error) {
        console.error('Error recalculating route:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to recalculate route',
            error: error.message
        });
    }
});

/**
 * GET /api/routes/all
 * Get all active routes for all drivers (for admin dashboard)
 */
router.get('/all', async (req, res) => {
    try {
        const drivers = await Driver.find({ isActive: true });
        const routes = [];

        for (const driver of drivers) {
            const deliveries = await Delivery.find({
                driverId: driver._id,
                status: { $in: ['Out for Delivery', 'Pending'] },
                routeSequence: { $gt: 0 }
            })
                .populate('customerId')
                .sort({ routeSequence: 1 });

            if (deliveries.length > 0) {
                let totalDistance = 0;
                for (let i = 0; i < deliveries.length - 1; i++) {
                    if (deliveries[i].coordinates && deliveries[i + 1].coordinates) {
                        totalDistance += RouteOptimizer.calculateDistance(
                            deliveries[i].coordinates,
                            deliveries[i + 1].coordinates
                        );
                    }
                }

                routes.push({
                    driver: {
                        id: driver._id,
                        name: driver.name,
                        truckNo: driver.truckNo,
                        currentLocation: driver.location,
                        isOnline: driver.isOnline
                    },
                    route: deliveries,
                    totalDistance: Math.round(totalDistance * 100) / 100,
                    estimatedTime: deliveries.length * 10 + Math.round((totalDistance / 30) * 60),
                    deliveryCount: deliveries.length
                });
            }
        }

        res.json({
            success: true,
            routes,
            totalDrivers: routes.length
        });

    } catch (error) {
        console.error('Error getting all routes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get all routes',
            error: error.message
        });
    }
});

/**
 * POST /api/routes/manual-reorder
 * Manually reorder deliveries for a driver
 */
router.post('/manual-reorder', async (req, res) => {
    try {
        const { driverId, deliveryOrder } = req.body;
        // deliveryOrder should be array of delivery IDs in desired order

        if (!driverId || !Array.isArray(deliveryOrder)) {
            return res.status(400).json({
                success: false,
                message: 'Driver ID and delivery order array required'
            });
        }

        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Update sequence for each delivery
        const updatePromises = deliveryOrder.map((deliveryId, index) => {
            return Delivery.findByIdAndUpdate(
                deliveryId,
                { routeSequence: index + 1 },
                { new: true }
            );
        });

        const updatedDeliveries = await Promise.all(updatePromises);

        // Get full delivery details
        const deliveries = await Delivery.find({
            _id: { $in: deliveryOrder }
        })
            .populate('customerId')
            .sort({ routeSequence: 1 });

        const directions = RouteOptimizer.getTurnByTurnDirections(deliveries);

        // Emit socket event
        if (req.io) {
            req.io.to(`driver_${driverId}`).emit('route:manually_reordered', {
                driverId,
                route: deliveries,
                directions,
                timestamp: new Date()
            });

            req.io.to('admins').emit('route:manually_reordered', {
                driverId,
                driverName: driver.name,
                route: deliveries,
                timestamp: new Date()
            });
        }

        res.json({
            success: true,
            message: 'Route manually reordered',
            route: deliveries,
            directions
        });

    } catch (error) {
        console.error('Error manually reordering route:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to manually reorder route',
            error: error.message
        });
    }
});

module.exports = router;
