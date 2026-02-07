// Buwate Tennis Club Constants

export const CLUB_INFO = {
  name: "Buwate Tennis Club",
  shortName: "Buwate Tennis Club",
  domain: "https://buwatetc.onrender.com",
  location: "Buwate, Kampala, Uganda",
  email: "btc2023@gmail.com",
  phones: ["+256 772 675 050", "+256 772 367 7325"],
  operatingHours: "7:00 AM - 11:00 PM daily",
  startHour: 7,
  endHour: 23,
  momoNumber: "0790229161",
  momoName: "Brian Isubikalu",
} as const;

export const PRICING = {
  courtBooking: {
    member: { standard: 10000, primeTime: 10000 },
    memberChild: { standard: 5000, primeTime: 5000 },
    memberSpouse: { standard: 10000, primeTime: 10000 },
    nonMember: { standard: 20000, primeTime: 25000 },
    nonMemberChild: { standard: 10000, primeTime: 12000 },
  },
  monthlyPackages: {
    memberMonthly: 150000,
    memberFamily: 200000,
    nonMemberMonthly: 200000,
  },
  membership: {
    registration: 100000,
    monthly: 50000,
    annual: 500000,
  },
  coaching: {
    private: 50000,
    semiPrivate: 35000,
    group: 25000,
    clinic: 20000,
  },
} as const;

export const BOOKING_RULES = {
  maxAdvanceDays: {
    member: 14,
    nonMember: 7,
  },
  minAdvanceHours: 24,
  maxDurationMinutes: 120,
  minDurationMinutes: 60,
  maxActiveBookings: 3,
  cancellation: {
    freeHours: 24,
    lateFeePercent: 50,
    noShowFeePercent: 100,
  },
  primeTimeHours: {
    morning: { start: 8, end: 12 },
    afternoon: { start: 15, end: 18 },
  },
} as const;

export const CLUB_RULES = [
  "No animals, pets, or toys inside the fenced court area",
  "No smoking within the fenced court area",
  "No vulgar language or aggressive behavior",
  "Only racquets, tennis balls, and players on clay courts",
  "Proper tennis attire required",
  "Violations may result in suspension or ban",
] as const;

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
