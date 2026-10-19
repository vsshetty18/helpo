import { EmergencyFacility } from '../types/incident';

export const EMERGENCY_FACILITIES: EmergencyFacility[] = [
  {
    id: 'fac-hosp-01',
    name: 'Apollo Spectra Hospital Koramangala',
    type: 'hospital',
    address: '143, 5th Block, KHB Colony, Koramangala, Bengaluru',
    phone: '+91 80 4668 8888',
    distanceKm: 0.8,
    etaMinutes: 3,
    lat: 12.9341,
    lng: 77.6202,
    status: 'Available'
  },
  {
    id: 'fac-hosp-02',
    name: "St. John's Medical College & Emergency Trauma",
    type: 'hospital',
    address: 'Sarjapur Main Road, John Nagar, Koramangala, Bengaluru',
    phone: '+91 80 2206 5000',
    distanceKm: 1.6,
    etaMinutes: 5,
    lat: 12.9284,
    lng: 77.6210,
    status: 'Available'
  },
  {
    id: 'fac-hosp-03',
    name: 'Manipal Hospital HAL Old Airport Road',
    type: 'hospital',
    address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru',
    phone: '+91 80 2502 4444',
    distanceKm: 4.2,
    etaMinutes: 11,
    lat: 12.9590,
    lng: 77.6480,
    status: 'Available'
  },
  {
    id: 'fac-pol-01',
    name: 'Koramangala Police Station (Law & Traffic)',
    type: 'police',
    address: '8th Main Rd, 4th Block, Koramangala, Bengaluru',
    phone: '+91 80 2294 2565',
    distanceKm: 1.1,
    etaMinutes: 4,
    lat: 12.9320,
    lng: 77.6280,
    status: 'Dispatched'
  },
  {
    id: 'fac-pol-02',
    name: 'Madiwala Traffic Police Station',
    type: 'police',
    address: 'Hosur Main Road, Madiwala, Bengaluru',
    phone: '+91 80 2294 2568',
    distanceKm: 2.3,
    etaMinutes: 7,
    lat: 12.9224,
    lng: 77.6190,
    status: 'Available'
  },
  {
    id: 'fac-fire-01',
    name: 'Bengaluru South Fire & Rescue Station',
    type: 'fire_station',
    address: 'Dairy Circle, Bannerghatta Road, Bengaluru',
    phone: '+91 80 2297 1500',
    distanceKm: 3.4,
    etaMinutes: 8,
    lat: 12.9370,
    lng: 77.6010,
    status: 'Standby'
  }
];
