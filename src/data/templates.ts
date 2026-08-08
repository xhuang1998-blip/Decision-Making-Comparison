import { DecisionTemplate } from '../types';

export const DECISION_TEMPLATES: DecisionTemplate[] = [
  {
    id: 'job-offer',
    title: 'Job Offer Evaluation',
    description: 'Compare competing career opportunities based on total compensation, growth, balance, and culture.',
    iconName: 'Briefcase',
    category: 'Career',
    criteria: [
      { name: 'Base Salary & Bonus', description: 'Annual total financial compensation', weight: 9, type: 'benefit' },
      { name: 'Work-Life Balance', description: 'Expected hours, flexibility, remote vs onsite', weight: 8, type: 'benefit' },
      { name: 'Career Growth Potential', description: 'Mentorship, promotion path, learning opportunities', weight: 9, type: 'benefit' },
      { name: 'Company Stability & Brand', description: 'Financial health, market reputation', weight: 6, type: 'benefit' },
      { name: 'Commute & Travel Time', description: 'Time and cost spent traveling to workplace', weight: 7, type: 'cost' },
      { name: 'Team Culture & Manager Fit', description: 'Alignment with team values and leadership style', weight: 8, type: 'benefit' },
    ],
    options: [
      {
        name: 'Tech Corp A (Hybrid)',
        description: 'Established mid-sized software company, 2 days remote.',
        scores: {
          'Base Salary & Bonus': 8,
          'Work-Life Balance': 7,
          'Career Growth Potential': 8,
          'Company Stability & Brand': 9,
          'Commute & Travel Time': 4, // 30 min commute
          'Team Culture & Manager Fit': 8,
        },
        color: '#2563EB',
      },
      {
        name: 'Startup B (100% Remote)',
        description: 'Series B AI startup with equity options.',
        scores: {
          'Base Salary & Bonus': 7,
          'Work-Life Balance': 6,
          'Career Growth Potential': 9,
          'Company Stability & Brand': 5,
          'Commute & Travel Time': 1, // 0 commute (lowest cost = highest norm score)
          'Team Culture & Manager Fit': 9,
        },
        color: '#059669',
      },
      {
        name: 'Enterprise C (Onsite)',
        description: 'Global financial institution with high base pay.',
        scores: {
          'Base Salary & Bonus': 10,
          'Work-Life Balance': 5,
          'Career Growth Potential': 6,
          'Company Stability & Brand': 10,
          'Commute & Travel Time': 8, // 1 hr commute (high cost = low norm score)
          'Team Culture & Manager Fit': 6,
        },
        color: '#D97706',
      },
    ],
  },
  {
    id: 'home-rental',
    title: 'Apartment & Home Search',
    description: 'Find your ideal home by weighing rent cost, location, space, safety, and transit access.',
    iconName: 'Home',
    category: 'Real Estate',
    criteria: [
      { name: 'Monthly Rent & Utilities', description: 'Total monthly housing expense', weight: 10, type: 'cost' },
      { name: 'Neighborhood & Safety', description: 'Safety index, noise, walkability', weight: 9, type: 'benefit' },
      { name: 'Size & Layout Space', description: 'Square footage, natural light, storage', weight: 7, type: 'benefit' },
      { name: 'Proximity to Transit / Work', description: 'Minutes to daily commute destination', weight: 8, type: 'benefit' },
      { name: 'Building Amenities', description: 'In-unit laundry, gym, parking, dishwasher', weight: 6, type: 'benefit' },
    ],
    options: [
      {
        name: 'Downtown High-Rise Loft',
        description: 'Modern 1BR with skyline view.',
        scores: {
          'Monthly Rent & Utilities': 9, // Expensive ($2,800)
          'Neighborhood & Safety': 9,
          'Size & Layout Space': 6,
          'Proximity to Transit / Work': 9,
          'Building Amenities': 10,
        },
        color: '#2563EB',
      },
      {
        name: 'Suburban Garden Apartment',
        description: 'Spacious 2BR with patio in quiet neighborhood.',
        scores: {
          'Monthly Rent & Utilities': 4, // Reasonable ($1,900)
          'Neighborhood & Safety': 8,
          'Size & Layout Space': 10,
          'Proximity to Transit / Work': 5,
          'Building Amenities': 6,
        },
        color: '#059669',
      },
      {
        name: 'Trendy Arts District Flat',
        description: 'Charming older building near cafes.',
        scores: {
          'Monthly Rent & Utilities': 6, // Moderate ($2,300)
          'Neighborhood & Safety': 7,
          'Size & Layout Space': 7,
          'Proximity to Transit / Work': 8,
          'Building Amenities': 4,
        },
        color: '#7C3AED',
      },
    ],
  },
  {
    id: 'car-purchase',
    title: 'Vehicle Purchase Decision',
    description: 'Evaluate cars based on upfront price, reliability, fuel efficiency, safety, and fun factor.',
    iconName: 'Car',
    category: 'Consumer',
    criteria: [
      { name: 'Total Purchase Price', description: 'Out of the door cost including taxes', weight: 9, type: 'cost' },
      { name: 'Reliability & Maintenance Cost', description: 'Expected annual repairs and longevity', weight: 9, type: 'benefit' },
      { name: 'Fuel / Energy Efficiency', description: 'MPG or EV range cost efficiency', weight: 7, type: 'benefit' },
      { name: 'Safety Rating & Tech', description: 'Crash test score, driver assist features', weight: 8, type: 'benefit' },
      { name: 'Driving Comfort & Style', description: 'Interior comfort, acceleration, design', weight: 6, type: 'benefit' },
    ],
    options: [
      {
        name: 'Compact EV Sedan',
        description: 'All-electric sedan with low running cost.',
        scores: {
          'Total Purchase Price': 7, // $38,000
          'Reliability & Maintenance Cost': 8,
          'Fuel / Energy Efficiency': 10,
          'Safety Rating & Tech': 9,
          'Driving Comfort & Style': 8,
        },
        color: '#2563EB',
      },
      {
        name: 'Japanese Hybrid SUV',
        description: 'Reliable hybrid crossover with high resale value.',
        scores: {
          'Total Purchase Price': 5, // $32,000
          'Reliability & Maintenance Cost': 10,
          'Fuel / Energy Efficiency': 9,
          'Safety Rating & Tech': 8,
          'Driving Comfort & Style': 7,
        },
        color: '#059669',
      },
      {
        name: 'Used Luxury Hatchback',
        description: 'Premium interior and sporty feel.',
        scores: {
          'Total Purchase Price': 4, // $26,000
          'Reliability & Maintenance Cost': 4,
          'Fuel / Energy Efficiency': 5,
          'Safety Rating & Tech': 7,
          'Driving Comfort & Style': 9,
        },
        color: '#DB2777',
      },
    ],
  },
  {
    id: 'tech-stack',
    title: 'Tech Framework & Architecture Selection',
    description: 'Choose the best software stack for a new project considering speed, ecosystem, and cost.',
    iconName: 'Code',
    category: 'Engineering',
    criteria: [
      { name: 'Developer Productivity & DX', description: 'Speed of shipping features and developer tooling', weight: 9, type: 'benefit' },
      { name: 'Ecosystem & Community Libraries', description: 'Availability of packages and community answers', weight: 8, type: 'benefit' },
      { name: 'Performance & Latency', description: 'Runtime efficiency and responsiveness', weight: 8, type: 'benefit' },
      { name: 'Infrastructure Hosting Cost', description: 'Monthly cloud infrastructure overhead', weight: 7, type: 'cost' },
      { name: 'Team Familiarity & Onboarding', description: 'Learning curve for current engineering team', weight: 9, type: 'benefit' },
    ],
    options: [
      {
        name: 'React + Node / Express + Cloud Run',
        description: 'Standard TypeScript full-stack SPA architecture.',
        scores: {
          'Developer Productivity & DX': 9,
          'Ecosystem & Community Libraries': 10,
          'Performance & Latency': 8,
          'Infrastructure Hosting Cost': 3, // Low cost
          'Team Familiarity & Onboarding': 9,
        },
        color: '#2563EB',
      },
      {
        name: 'Next.js Serverless SSR',
        description: 'Full-stack React framework with edge rendering.',
        scores: {
          'Developer Productivity & DX': 8,
          'Ecosystem & Community Libraries': 9,
          'Performance & Latency': 9,
          'Infrastructure Hosting Cost': 6, // Moderate cost
          'Team Familiarity & Onboarding': 7,
        },
        color: '#059669',
      },
      {
        name: 'Go Microservice + React SPA',
        description: 'High performance compiled Go backend.',
        scores: {
          'Developer Productivity & DX': 6,
          'Ecosystem & Community Libraries': 7,
          'Performance & Latency': 10,
          'Infrastructure Hosting Cost': 2, // Extremely low memory footprint
          'Team Familiarity & Onboarding': 5,
        },
        color: '#D97706',
      },
    ],
  },
];
