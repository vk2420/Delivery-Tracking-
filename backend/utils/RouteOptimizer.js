/**
 * Route Optimizer - Custom TSP Solver
 * Uses Nearest Neighbor + 2-Opt optimization for delivery route optimization
 * No external APIs required
 */

class RouteOptimizer {
    /**
     * Calculate distance between two coordinates using Haversine formula
     * @param {Object} coord1 - {lat, lng}
     * @param {Object} coord2 - {lat, lng}
     * @returns {number} Distance in kilometers
     */
    static calculateDistance(coord1, coord2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(coord2.lat - coord1.lat);
        const dLng = this.toRad(coord2.lng - coord1.lng);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(coord1.lat)) * Math.cos(this.toRad(coord2.lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    static toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Build distance matrix for all delivery points
     * @param {Array} deliveries - Array of delivery objects with coordinates
     * @returns {Array} 2D distance matrix
     */
    static buildDistanceMatrix(deliveries) {
        const n = deliveries.length;
        const matrix = Array(n).fill(null).map(() => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    matrix[i][j] = this.calculateDistance(
                        deliveries[i].coordinates,
                        deliveries[j].coordinates
                    );
                }
            }
        }

        return matrix;
    }

    /**
     * Nearest Neighbor algorithm to find initial route
     * @param {Array} distanceMatrix - 2D distance matrix
     * @param {number} startIndex - Starting point index
     * @returns {Array} Route as array of indices
     */
    static nearestNeighbor(distanceMatrix, startIndex = 0) {
        const n = distanceMatrix.length;
        const visited = new Array(n).fill(false);
        const route = [startIndex];
        visited[startIndex] = true;

        let current = startIndex;

        for (let i = 1; i < n; i++) {
            let nearest = -1;
            let minDistance = Infinity;

            for (let j = 0; j < n; j++) {
                if (!visited[j] && distanceMatrix[current][j] < minDistance) {
                    minDistance = distanceMatrix[current][j];
                    nearest = j;
                }
            }

            if (nearest !== -1) {
                route.push(nearest);
                visited[nearest] = true;
                current = nearest;
            }
        }

        return route;
    }

    /**
     * Calculate total route distance
     * @param {Array} route - Route as array of indices
     * @param {Array} distanceMatrix - 2D distance matrix
     * @returns {number} Total distance
     */
    static calculateRouteDistance(route, distanceMatrix) {
        let totalDistance = 0;
        for (let i = 0; i < route.length - 1; i++) {
            totalDistance += distanceMatrix[route[i]][route[i + 1]];
        }
        return totalDistance;
    }

    /**
     * 2-Opt optimization to improve route
     * @param {Array} route - Initial route
     * @param {Array} distanceMatrix - 2D distance matrix
     * @param {number} maxIterations - Maximum iterations
     * @returns {Array} Optimized route
     */
    static twoOptOptimization(route, distanceMatrix, maxIterations = 100) {
        let improved = true;
        let iterations = 0;
        let bestRoute = [...route];
        let bestDistance = this.calculateRouteDistance(bestRoute, distanceMatrix);

        while (improved && iterations < maxIterations) {
            improved = false;
            iterations++;

            for (let i = 1; i < route.length - 2; i++) {
                for (let j = i + 1; j < route.length - 1; j++) {
                    // Reverse segment between i and j
                    const newRoute = [
                        ...bestRoute.slice(0, i),
                        ...bestRoute.slice(i, j + 1).reverse(),
                        ...bestRoute.slice(j + 1)
                    ];

                    const newDistance = this.calculateRouteDistance(newRoute, distanceMatrix);

                    if (newDistance < bestDistance) {
                        bestRoute = newRoute;
                        bestDistance = newDistance;
                        improved = true;
                    }
                }
            }
        }

        return bestRoute;
    }

    /**
     * Main optimization function
     * @param {Array} deliveries - Array of delivery objects with coordinates
     * @param {Object} startLocation - Starting location {lat, lng} (optional)
     * @returns {Object} Optimized route with metadata
     */
    static optimizeRoute(deliveries, startLocation = null) {
        // Filter deliveries with valid coordinates
        const validDeliveries = deliveries.filter(d =>
            d.coordinates &&
            typeof d.coordinates.lat === 'number' &&
            typeof d.coordinates.lng === 'number'
        );

        if (validDeliveries.length === 0) {
            return {
                success: false,
                message: 'No deliveries with valid coordinates',
                optimizedRoute: [],
                totalDistance: 0,
                estimatedTime: 0
            };
        }

        if (validDeliveries.length === 1) {
            return {
                success: true,
                optimizedRoute: [{
                    ...validDeliveries[0],
                    sequence: 1,
                    distanceFromPrevious: 0
                }],
                totalDistance: 0,
                estimatedTime: 0
            };
        }

        // Build distance matrix
        const distanceMatrix = this.buildDistanceMatrix(validDeliveries);

        // Find initial route using Nearest Neighbor
        let route = this.nearestNeighbor(distanceMatrix, 0);

        // Optimize using 2-Opt
        route = this.twoOptOptimization(route, distanceMatrix);

        // Calculate total distance
        const totalDistance = this.calculateRouteDistance(route, distanceMatrix);

        // Estimate time (assuming average speed of 30 km/h + 10 min per stop)
        const drivingTime = (totalDistance / 30) * 60; // minutes
        const stopTime = validDeliveries.length * 10; // 10 min per stop
        const estimatedTime = Math.round(drivingTime + stopTime);

        // Build optimized route with metadata
        const optimizedRoute = route.map((index, sequence) => {
            const delivery = validDeliveries[index];
            const distanceFromPrevious = sequence === 0
                ? 0
                : distanceMatrix[route[sequence - 1]][index];

            return {
                ...delivery,
                sequence: sequence + 1,
                distanceFromPrevious: Math.round(distanceFromPrevious * 100) / 100, // Round to 2 decimals
                estimatedArrival: this.estimateArrivalTime(sequence, route, distanceMatrix)
            };
        });

        return {
            success: true,
            optimizedRoute,
            totalDistance: Math.round(totalDistance * 100) / 100,
            estimatedTime,
            efficiency: this.calculateEfficiency(route, distanceMatrix, validDeliveries.length)
        };
    }

    /**
     * Estimate arrival time for each stop
     * @param {number} stopIndex - Index of the stop in route
     * @param {Array} route - Complete route
     * @param {Array} distanceMatrix - Distance matrix
     * @returns {Date} Estimated arrival time
     */
    static estimateArrivalTime(stopIndex, route, distanceMatrix) {
        const now = new Date();
        let totalTime = 0; // in minutes

        for (let i = 0; i < stopIndex; i++) {
            const distance = distanceMatrix[route[i]][route[i + 1]];
            const drivingTime = (distance / 30) * 60; // 30 km/h average
            const stopTime = 10; // 10 min per stop
            totalTime += drivingTime + stopTime;
        }

        return new Date(now.getTime() + totalTime * 60000);
    }

    /**
     * Calculate route efficiency (compared to worst case)
     * @param {Array} route - Optimized route
     * @param {Array} distanceMatrix - Distance matrix
     * @param {number} numDeliveries - Number of deliveries
     * @returns {number} Efficiency percentage
     */
    static calculateEfficiency(route, distanceMatrix, numDeliveries) {
        const optimizedDistance = this.calculateRouteDistance(route, distanceMatrix);

        // Calculate average distance for random routes (sample 10 random routes)
        let totalRandomDistance = 0;
        const samples = Math.min(10, numDeliveries);

        for (let i = 0; i < samples; i++) {
            const randomRoute = this.shuffleArray([...route]);
            totalRandomDistance += this.calculateRouteDistance(randomRoute, distanceMatrix);
        }

        const avgRandomDistance = totalRandomDistance / samples;
        const efficiency = ((avgRandomDistance - optimizedDistance) / avgRandomDistance) * 100;

        return Math.max(0, Math.round(efficiency * 10) / 10); // Round to 1 decimal
    }

    /**
     * Shuffle array (Fisher-Yates algorithm)
     */
    static shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /**
     * Get turn-by-turn directions (simplified)
     * @param {Array} optimizedRoute - Optimized route with coordinates
     * @returns {Array} Turn-by-turn directions
     */
    static getTurnByTurnDirections(optimizedRoute) {
        const directions = [];

        for (let i = 0; i < optimizedRoute.length; i++) {
            const current = optimizedRoute[i];
            const next = optimizedRoute[i + 1];

            directions.push({
                step: i + 1,
                instruction: i === 0
                    ? `Start at ${current.customerName || current.address}`
                    : `Proceed to ${current.customerName || current.address}`,
                distance: current.distanceFromPrevious,
                location: current.coordinates,
                deliveryId: current._id || current.id
            });

            if (next) {
                const bearing = this.calculateBearing(current.coordinates, next.coordinates);
                const direction = this.bearingToDirection(bearing);

                directions.push({
                    step: i + 1.5,
                    instruction: `Head ${direction} towards ${next.customerName || next.address}`,
                    distance: this.calculateDistance(current.coordinates, next.coordinates),
                    bearing
                });
            }
        }

        return directions;
    }

    /**
     * Calculate bearing between two points
     */
    static calculateBearing(coord1, coord2) {
        const dLng = this.toRad(coord2.lng - coord1.lng);
        const lat1 = this.toRad(coord1.lat);
        const lat2 = this.toRad(coord2.lat);

        const y = Math.sin(dLng) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

        const bearing = Math.atan2(y, x);
        return (this.toDeg(bearing) + 360) % 360;
    }

    static toDeg(radians) {
        return radians * (180 / Math.PI);
    }

    /**
     * Convert bearing to cardinal direction
     */
    static bearingToDirection(bearing) {
        const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
        const index = Math.round(bearing / 45) % 8;
        return directions[index];
    }
}

module.exports = RouteOptimizer;
