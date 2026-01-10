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
// FUNCTION: Add Product (Create)
// =====================================================
// This function sends a POST request to add a new product
async function addProduct(title, description, price, category, thumbnail) {
    try {
        // Step 1: Create the product object with all essential data from form
        const productData = {
            title: title,
            description: description,
            price: price,
            category: category,
            thumbnail: thumbnail
        };
        
        // Step 2: Send POST request to API using fetch with async/await
        const response = await fetch('https://dummyjson.com/products/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData) // Convert JavaScript object to JSON string
        });
        
        // Step 3: Convert response to JSON
        const data = await response.json();
        
        // Step 4: Log the returned data to console (for debugging)
        console.log('Product added successfully:', data);
        
        // Step 5: Show success message to user
        alert('Product Added');
        
        // Step 6: Close the modal after successful addition
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();
        
        // Step 7: Clear the form for next use
        document.getElementById('addProductForm').reset();
        
    } catch (error) {
        // Handle any errors during the add process
        console.error('Error adding product:', error);
        alert('Failed to add product. Please try again.');
    }
}

// =====================================================
// FUNCTION: Delete Product
// =====================================================
// This function sends a DELETE request and removes the card from UI
async function deleteProduct(productId) {
    try {
        // Step 1: Send DELETE request to API
        const response = await fetch(`https://dummyjson.com/products/${productId}`, {
            method: 'DELETE'
        });
        
        // Step 2: Check if the response status is 200 (success)
        if (response.status === 200) {
            // Step 3: Convert response to JSON
            const data = await response.json();
            console.log('Product deleted successfully:', data);
            
            // Step 4: Find the product card in the DOM and remove it
            // We need to find the card that contains the button with this product ID
            const productCards = document.querySelectorAll('#product-container .col-md-4');
            
            // Loop through all cards to find the one with matching product ID
            productCards.forEach(card => {
                const deleteButton = card.querySelector(`button[onclick="deleteProduct(${productId})"]`);
                if (deleteButton) {
                    // Remove the card from DOM with a smooth animation
                    card.style.opacity = '0';
                    card.style.transition = 'opacity 0.3s';
                    
                    // Wait for animation to complete before removing
                    setTimeout(() => {
                        card.remove();
                    }, 300);
                }
            });
            
            // Step 5: Show success message
            alert('Product deleted successfully');
        } else {
            // If status is not 200, show error
            alert('Failed to delete product');
        }
        
    } catch (error) {
        // Handle any errors during the delete process
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
    }
}

// =====================================================
// Initialize the application when page loads
// =====================================================
// This runs when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display products when page loads
    fetchProducts();
    
    // =====================================================
    // EVENT LISTENER: Add Product Form Submission
    // =====================================================
    const addProductForm = document.getElementById('addProductForm');
    
    addProductForm.addEventListener('submit', function(event) {
        // Step 1: Prevent default form submission (prevents page refresh)
        event.preventDefault();
        
        // Step 2: Get all the values from the form inputs
        const title = document.getElementById('productTitle').value;
        const description = document.getElementById('productDescription').value;
        const price = parseFloat(document.getElementById('productPrice').value); // Convert to number
        const category = document.getElementById('productCategory').value;
        const thumbnail = document.getElementById('productThumbnail').value;
        
        // Step 3: Call the addProduct function with all the form data
        addProduct(title, description, price, category, thumbnail);
    });
});
