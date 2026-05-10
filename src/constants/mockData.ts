// Mock Users
export const mockUser = {
  id: 'usr_001',
  name: 'Dr. Sara Ahmed',
  email: 'sara@alshifaclinic.com',
  organizationType: 'clinic',
  businessName: 'Al-Shifa Clinic',
  logoUrl: null,
  isVerified: true,
  createdAt: '2026-01-15T10:00:00Z'
};

// Mock Projects
export const mockProjects = [
  { 
    id: 'proj_001', 
    name: 'Patient Portal Redesign', 
    domain: 'clinic', 
    status: 'INTAKE', 
    orgName: 'Wellness First Medical', 
    updatedAt: '2 hours ago' 
  },
  { 
    id: 'proj_002', 
    name: 'LMS Dashboard Implementation', 
    domain: 'school', 
    status: 'SPEC_READY', 
    orgName: 'Riverside Academy', 
    updatedAt: '5 hours ago' 
  },
  { 
    id: 'proj_003', 
    name: 'Doctor Appointment Scheduling', 
    domain: 'clinic', 
    status: 'PREVIEW', 
    orgName: 'Nexus Clinic Systems', 
    updatedAt: '1 day ago' 
  },
  { 
    id: 'proj_004', 
    name: 'Student Attendance Management', 
    domain: 'school', 
    status: 'LIVE', 
    orgName: 'Urban Co.', 
    updatedAt: '3 days ago' 
  },
  { 
    id: 'proj_005', 
    name: 'School Fee Management', 
    domain: 'school', 
    status: 'SPEC_READY', 
    orgName: 'Pacific Trust Partners', 
    updatedAt: '1 week ago' 
  }
];

// Mock Themes (12 total)
export const mockThemes = [
  { id: 'clinical-blue', name: 'Clinical Blue', primary: '#1E40AF', secondary: '#60A5FA', domain: 'clinic' },
  { id: 'warm-care', name: 'Warm Care', primary: '#EA580C', secondary: '#FB923C', domain: 'clinic' },
  { id: 'modern-clinic', name: 'Modern Clinic', primary: '#0F766E', secondary: '#2DD4BF', domain: 'clinic' },
  { id: 'pure-health', name: 'Pure Health', primary: '#059669', secondary: '#34D399', domain: 'clinic' },
  { id: 'calm-clinic', name: 'Calm Clinic', primary: '#7C3AED', secondary: '#A78BFA', domain: 'clinic' },
  { id: 'bright-medical', name: 'Bright Medical', primary: '#DC2626', secondary: '#FCA5A5', domain: 'clinic' },
  { id: 'school-green', name: 'School Green', primary: '#16A34A', secondary: '#4ADE80', domain: 'school' },
  { id: 'academic-navy', name: 'Academic Navy', primary: '#3730A3', secondary: '#818CF8', domain: 'school' },
  { id: 'bright-learning', name: 'Bright Learning', primary: '#D97706', secondary: '#FCD34D', domain: 'school' },
  { id: 'campus-blue', name: 'Campus Blue', primary: '#0369A1', secondary: '#38BDF8', domain: 'school' },
  { id: 'edu-teal', name: 'Edu Teal', primary: '#0F766E', secondary: '#5EEAD4', domain: 'school' },
  { id: 'classic-school', name: 'Classic School', primary: '#1F2937', secondary: '#6B7280', domain: 'school' }
];
