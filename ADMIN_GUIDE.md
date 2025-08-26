# Eden Parfum Admin Panel User Guide

## 🌟 Overview
The Eden Parfum Admin Panel is a comprehensive web-based interface for managing your perfume catalog and brands. It provides full CRUD (Create, Read, Update, Delete) operations for both brands and perfumes, along with analytics and image management.

## 🚀 Accessing the Admin Panel
Navigate to: `http://localhost:3000/admin.html`

## 📊 Dashboard
The dashboard provides an overview of your perfume business:
- **Total Brands**: Number of brands in your database
- **Active Perfumes**: Number of perfumes currently active
- **Inactive Perfumes**: Number of deactivated perfumes
- **Top Brands**: Brands with the most perfumes

## 🏷️ Brand Management

### Adding a New Brand
1. Click "Brands" in the navigation
2. Click "➕ Add Brand" button
3. Fill in the brand information:
   - **Brand Name** (required): The name of the brand
   - **Country**: Country of origin
   - **Founded Year**: Year the brand was established
   - **Description**: Brief description of the brand
   - **Brand Logo**: Upload an image file (JPG, PNG, etc.)
4. Click "Save Brand"

### Editing a Brand
1. In the Brands section, find the brand you want to edit
2. Click the "Edit" button for that brand
3. Modify the information in the modal
4. Click "Save Brand"

### Deleting a Brand
1. In the Brands section, find the brand you want to delete
2. Click the "Delete" button for that brand
3. Confirm the deletion
   
**Note**: You cannot delete a brand that has active perfumes. Deactivate or delete the perfumes first.

### Searching Brands
Use the search bar above the brands table to search by brand name or country.

## 💎 Perfume Management

### Adding a New Perfume
1. Click "Perfumes" in the navigation
2. Click "➕ Add Perfume" button
3. Fill in the perfume information:
   - **Perfume Name** (required): Name of the perfume
   - **Brand** (required): Select from existing brands
   - **Gender** (required): Male, Female, or Unisex
   - **Size**: Size in ml (e.g., "50ml", "100ml")
   - **Price**: Price in your currency
   - **Status**: Active or Inactive
   - **Description**: Detailed description
   - **Fragrance Notes**: Top, middle, and base notes
   - **Longevity**: How long the fragrance lasts
   - **Sillage**: How far the fragrance projects
   - **Best Season**: Optimal season for wearing
   - **Best Occasion**: Suitable occasions
   - **Perfume Image**: Upload an image file
4. Click "Save Perfume"

### Editing a Perfume
1. In the Perfumes section, find the perfume you want to edit
2. Click the "Edit" button for that perfume
3. Modify the information in the modal
4. Click "Save Perfume"

### Deleting a Perfume
1. In the Perfumes section, find the perfume you want to delete
2. Click the "Delete" button for that perfume
3. Choose between:
   - **Deactivate**: Soft delete (perfume remains in database but is hidden)
   - **Permanent Delete**: Complete removal from database (cannot be undone)

### Searching and Filtering Perfumes
- **Search**: Use the search bar to search by perfume name or brand
- **Filter by Brand**: Use the dropdown to filter perfumes by specific brand
- **Pagination**: Navigate through multiple pages of perfumes

## 📸 Image Management

### Supported Image Formats
- JPG, JPEG
- PNG
- GIF
- WebP
- AVIF

### Image Guidelines
- **Maximum Size**: 5MB per image
- **Recommended Resolution**: 
  - Brand logos: 200x200px to 500x500px
  - Perfume images: 300x300px to 800x800px
- **File Naming**: Use descriptive names without special characters

### Image Storage
- All images are stored in `/frontend/photos/` directory
- Images are automatically served as static files
- When updating images, old images are automatically deleted

## 🔧 Features

### Status Management
- **Active Perfumes**: Visible to customers on the website
- **Inactive Perfumes**: Hidden from customers but retained in database
- Easy toggle between active/inactive status

### Pagination
- Perfumes are displayed with pagination (10 per page by default)
- Navigate using Previous/Next buttons or page numbers

### Real-time Updates
- All changes are reflected immediately in the interface
- Automatic refresh of data after operations

### Error Handling
- Clear error messages for validation issues
- Success notifications for completed operations
- Prevents deletion of brands with active perfumes

## 🛠️ API Endpoints
The admin panel uses the following API endpoints:

### Analytics
- `GET /api/admin/analytics` - Get dashboard statistics

### Brands
- `GET /api/admin/brands` - Get all brands
- `POST /api/admin/brands` - Create new brand
- `PUT /api/admin/brands/:id` - Update brand
- `DELETE /api/admin/brands/:id` - Delete brand

### Perfumes
- `GET /api/admin/perfumes` - Get all perfumes with pagination
- `GET /api/admin/perfumes/:id` - Get specific perfume
- `POST /api/admin/perfumes` - Create new perfume
- `PUT /api/admin/perfumes/:id` - Update perfume
- `DELETE /api/admin/perfumes/:id` - Delete perfume

## 🔒 Security Considerations

### File Upload Security
- Only image files are accepted
- File size limited to 5MB
- Files are stored outside the web root for security

### Data Validation
- Required fields are enforced
- Brand existence is verified before creating perfumes
- Duplicate brand names are prevented

## 📱 Mobile Responsive
The admin panel is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🎨 UI Features
- Clean, modern interface
- Intuitive navigation
- Color-coded status indicators
- Image previews
- Search and filter capabilities
- Pagination controls
- Modal dialogs for forms
- Success/error notifications

## 🚨 Troubleshooting

### Common Issues

1. **Images not uploading**
   - Check file size (must be under 5MB)
   - Ensure file is an image format
   - Check file permissions

2. **Cannot delete brand**
   - Make sure the brand has no active perfumes
   - Deactivate perfumes first, then delete brand

3. **Page not loading**
   - Ensure the backend server is running
   - Check that you're accessing the correct URL
   - Verify database connection

4. **Search not working**
   - Try refreshing the page
   - Check your search terms
   - Ensure data has been loaded

## 🔄 Backup Recommendations
- Regularly backup your database
- Keep copies of uploaded images
- Test restore procedures

## 📞 Support
For technical support or feature requests, please contact the development team.

---

*Eden Parfum Admin Panel - Professional Perfume Catalog Management*
