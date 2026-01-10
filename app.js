// =====================================================
// ShopManage - Product Management System
// Single Page Application (SPA) using Vanilla JavaScript
// =====================================================

// Get reference to the product container where products will be displayed
const productContainer = document.getElementById('product-container');

// =====================================================
// FUNCTION: Fetch Products from API
// =====================================================
// This function fetches product data from the API and displays it
async function fetchProducts() {
    try {
        // Step 1: Show loading message while data is being fetched
        productContainer.innerHTML = `
            <div class="col-12 text-center mt-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading products...</p>
            </div>
        `;

        // Step 2: Fetch data from API using fetch with async/await
        const response = await fetch('https://dummyjson.com/products?limit=10');
        
        // Step 3: Convert response to JSON format
        const data = await response.json();
        
        // Step 4: Clear the loading message
        productContainer.innerHTML = '';
        
        // Step 5: Loop through each product in the products array
        // Note: API returns an object with a 'products' array inside
        data.products.forEach(product => {
            // Call function to create and display each product card
            displayProduct(product);
        });
        
    } catch (error) {
        // Step 6: Handle any errors that occur during fetch
        console.error('Error fetching products:', error);
        
        // Show error message to user
        productContainer.innerHTML = `
            <div class="col-12 text-center mt-5">
                <div class="alert alert-danger" role="alert">
                    Failed to load products. Please check your internet connection and try again.
                </div>
            </div>
        `;
    }
}

// =====================================================
// FUNCTION: Display Single Product as Bootstrap Card
// =====================================================
// This function creates a Bootstrap card for each product
function displayProduct(product) {
    // Step 1: Create a new column div for Bootstrap grid
    const productCard = document.createElement('div');
    productCard.className = 'col-md-4 col-sm-6 mb-4'; // Responsive: 3 cards on medium screens, 2 on small
    
    // Step 2: Create the card HTML structure with product details
    productCard.innerHTML = `
        <div class="card h-100 shadow-sm">
            <!-- Product Image -->
            <img src="${product.thumbnail}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: cover;">
            
            <!-- Card Body with Product Details -->
            <div class="card-body d-flex flex-column">
                <!-- Product Title -->
                <h5 class="card-title">${product.title}</h5>
                
                <!-- Product Category -->
                <p class="card-text">
                    <span class="badge bg-secondary">${product.category}</span>
                </p>
                
                <!-- Product Price -->
                <p class="card-text">
                    <strong class="text-success fs-5">$${product.price}</strong>
                </p>
                
                <!-- Action Buttons (Edit and Delete) -->
                <div class="mt-auto">
                    <button class="btn btn-warning btn-sm me-2" onclick="editProduct(${product.id})">
                        Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Step 3: Add the card to the product container
    productContainer.appendChild(productCard);
}

// =====================================================
// FUNCTION: Edit Product (Placeholder)
// =====================================================
function editProduct(productId) {
    // TODO: Will implement edit functionality later
    console.log('Edit product with ID:', productId);
    alert(`Edit functionality for product ID ${productId} will be implemented next.`);
}

// =====================================================
// FUNCTION: Delete Product (Placeholder)
// =====================================================
function deleteProduct(productId) {
    // TODO: Will implement delete functionality later
    console.log('Delete product with ID:', productId);
    alert(`Delete functionality for product ID ${productId} will be implemented next.`);
}

// =====================================================
// Initialize the application when page loads
// =====================================================
// This runs when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display products when page loads
    fetchProducts();
});
