export const HOSTELS = {
  BOYS: [
    { id: 'B', name: 'Amritam Hall', code: 'Hostel-B' },
    { id: 'C', name: 'Prithvi Hall', code: 'Hostel-C' },
    { id: 'D', name: 'Neeram Hall', code: 'Hostel-D' },
    { id: 'H', name: 'Vyan Hall', code: 'Hostel-H' },
    { id: 'J', name: 'Tejas Hall', code: 'Hostel-J' },
    { id: 'K', name: 'Ambaram Hall', code: 'Hostel-K' },
    { id: 'L', name: 'Viyat Hall', code: 'Hostel-L' },
    { id: 'M', name: 'Anantam Hall', code: 'Hostel-M' },
    { id: 'O', name: 'Vyom Hall', code: 'Hostel-O' },
    { id: 'FRF', name: 'Hostel-FRF/G', code: 'Hostel-FRF/G' }
  ],
  GIRLS: [
    { id: 'A', name: 'Agira Hall', code: 'Hostel-A' },
    { id: 'E', name: 'Vasudha Hall – Block E', code: 'Hostel-E' },
    { id: 'G', name: 'Vasudha Hall – Block G', code: 'Hostel-G' },
    { id: 'I', name: 'Ira Hall', code: 'Hostel-I' },
    { id: 'N', name: 'Ananta Hall', code: 'Hostel-N' },
    { id: 'PG', name: 'Hostel-PG', code: 'Hostel-PG' },
    { id: 'Q', name: 'Vahni Hall', code: 'Hostel-Q' }
  ]
};

export const getHostelDisplay = (hostelCode) => {
  const allHostels = [...HOSTELS.BOYS, ...HOSTELS.GIRLS];
  const hostel = allHostels.find(h => h.code === hostelCode);
  return hostel ? `${hostel.name} (${hostel.code})` : hostelCode;
}; 