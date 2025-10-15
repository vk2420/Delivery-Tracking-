// Delivery Source to Cluster and Concept Mapping

const DELIVERY_SOURCE_MAPPING = {
  // Homebox Concept
  'LJSW': { cluster: 'Jeddah', concept: 'Homebox' },
  'LJAW': { cluster: 'Al Baha', concept: 'Homebox' },
  'LJMD': { cluster: 'Madina', concept: 'Homebox' },
  'MKHW': { cluster: 'Makkah', concept: 'Homebox' },
  'LJTW': { cluster: 'Taif', concept: 'Homebox' },
  'LJYW': { cluster: 'Yanbu', concept: 'Homebox' },
  
  // Homecenter Concept
  'LSMW': { cluster: 'Madina', concept: 'Homecenter' },
  'LJHW': { cluster: 'Jeddah', concept: 'Homecenter' },
  'HBQW': { cluster: 'Makkah', concept: 'Homecenter' },
  'TAIF': { cluster: 'Taif', concept: 'Homecenter' },
  'LSYW': { cluster: 'Yanbu', concept: 'Homecenter' },
  // Al Baha for Homecenter comes under Jeddah
  'LJAW_HC': { cluster: 'Jeddah', concept: 'Homecenter' }
};

const CLUSTER_OPTIONS = [
  { value: '', label: 'All Clusters' },
  { value: 'Jeddah', label: 'Jeddah' },
  { value: 'Al Baha', label: 'Al Baha' },
  { value: 'Madina', label: 'Madina' },
  { value: 'Makkah', label: 'Makkah' },
  { value: 'Taif', label: 'Taif' },
  { value: 'Yanbu', label: 'Yanbu' }
];

const CONCEPT_OPTIONS = [
  { value: '', label: 'All Concepts' },
  { value: 'Homebox', label: 'Homebox (HB)' },
  { value: 'Homecenter', label: 'Homecenter (HC)' }
];

const getClusterAndConcept = (deliverySource) => {
  const mapping = DELIVERY_SOURCE_MAPPING[deliverySource];
  if (mapping) {
    return {
      cluster: mapping.cluster,
      concept: mapping.concept
    };
  }
  
  // Default fallback
  return {
    cluster: 'Unknown',
    concept: 'Unknown'
  };
};

const getClusterOptions = () => CLUSTER_OPTIONS;
const getConceptOptions = () => CONCEPT_OPTIONS;

module.exports = {
  DELIVERY_SOURCE_MAPPING,
  CLUSTER_OPTIONS,
  CONCEPT_OPTIONS,
  getClusterAndConcept,
  getClusterOptions,
  getConceptOptions
};