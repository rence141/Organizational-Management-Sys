import { getToken, getAuthHeaders } from '../lib/auth';

const API_BASE_URL = 'http://localhost:3000/api';

// Get current user's organization
export const getMyOrganization = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/organizations/my-organization`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch organization');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching organization:', error);
    // Return mock data for demo
    return {
      id: 1,
      name: "TechCorp Solutions",
      description: "Leading technology solutions provider",
      industry: "Technology",
      size: "51-200",
      website: "https://techcorp.example.com",
      phone: "+1 234-567-8900",
      email: "contact@techcorp.example.com",
      address: "123 Tech Street, Silicon Valley, CA 94025",
      founded: "2018",
      logo: "/api/placeholder/200/200",
      status: "Active",
      subscription: "Pro Plan",
      members: 45,
      createdAt: "2018-03-15",
      updatedAt: "2024-12-15"
    };
  }
};

// Update organization details
export const updateOrganization = async (organizationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/organizations/my-organization`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(organizationData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update organization');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating organization:', error);
    // For demo purposes, simulate successful update
    return { 
      success: true, 
      message: 'Organization updated successfully',
      data: { ...organizationData, updatedAt: new Date().toISOString() }
    };
  }
};

// Upload organization logo
export const uploadLogo = async (file) => {
  try {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await fetch(`${API_BASE_URL}/organizations/upload-logo`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload logo');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading logo:', error);
    // For demo purposes, return mock URL
    return { 
      success: true, 
      logoUrl: `/api/placeholder/200/200?timestamp=${Date.now()}` 
    };
  }
};
