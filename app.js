// =====================================================
// ShopManage - Product Management System
// Single Page Application (SPA) using Vanilla JavaScript
// =====================================================

// Get reference to the product container where products will be displayed
const productContainer = document.getElementById('product-container');

// Global variable to store the ID of the product being edited
// If null, we're in 'Add' mode. If it has a value, we're in 'Edit' mode
let editingProductId = null;

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
        
        // Update product count in hero section
        updateProductCount();
        
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
    
    // Step 1b: Add a unique ID to this card so we can find it later when deleting
    productCard.setAttribute('data-product-id', product.id);
    
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
// FUNCTION: Update Product Count
// =====================================================
// This function counts and displays the total number of products
function updateProductCount() {
    const productCards = document.querySelectorAll('#product-container .col-md-4');
    const count = productCards.length;
    const countElement = document.getElementById('productCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

// =====================================================
// FUNCTION: Edit Product
// =====================================================
// This function fetches product data and opens the modal with pre-filled data
async function editProduct(productId) {
    try {
        // Step 1: Fetch the single product data from API
        const response = await fetch(`https://dummyjson.com/products/${productId}`);
        
        // Step 2: Convert response to JSON
        const product = await response.json();
        
        // Step 3: Store the product ID globally so we know we're in Edit mode
        editingProductId = productId;
        
        // Step 4: Pre-fill the form fields with existing product data
        document.getElementById('productTitle').value = product.title;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productThumbnail').value = product.thumbnail;
        
        // Step 5: Change the modal title to show we're editing
        document.getElementById('addProductModalLabel').textContent = 'Edit Product';
        
        // Step 5b: Change the submit button text to 'Update Product'
        document.getElementById('submitProductBtn').textContent = 'Update Product';
        
        // Step 6: Open the modal
        const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
        modal.show();
        
    } catch (error) {
        // Handle any errors during fetch
        console.error('Error fetching product for edit:', error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to load product data. Please try again.'
        });
    }
}

// =====================================================
// FUNCTION: Update Product
// =====================================================
// This function sends a PUT request to update an existing product
async function updateProduct(productId, title, description, price, category, thumbnail) {
    try {
        // Step 1: Create the product object with updated data
        const productData = {
            title: title,
            description: description,
            price: price,
            category: category,
            thumbnail: thumbnail
        };
        
        // Step 2: Send PUT request to API using fetch with async/await
        const response = await fetch(`https://dummyjson.com/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData) // Convert JavaScript object to JSON string
        });
        
        // Step 3: Check if the response status is 200 (success)
        if (response.status === 200) {
            // Step 4: Convert response to JSON
            const data = await response.json();
            
            // Step 5: Log the returned data to console (for debugging)
            console.log('Product updated successfully:', data);
            
            // Step 6: Update the product card on the page with new data
            // First, remove the old card
            const oldCard = document.querySelector(`[data-product-id="${productId}"]`);
            if (oldCard) {
                oldCard.remove();
            }
            
            // Then, display the updated product card
            displayProduct(data);
            
            // Step 7: Show success message to user
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Product updated successfully!',
                timer: 2000,
                showConfirmButton: false
            });
            
            // Step 8: Close the modal after successful update
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
            modal.hide();
            
            // Step 9: Clear the form and reset editing mode
            document.getElementById('addProductForm').reset();
            editingProductId = null; // Clear the editing ID
            document.getElementById('addProductModalLabel').textContent = 'Add New Product'; // Reset modal title
            document.getElementById('submitProductBtn').textContent = 'Add Product'; // Reset button text
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'Failed to update product. Please try again.'
            });
        }
        
    } catch (error) {
        // Handle any errors during the update process
        console.error('Error updating product:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update product. Please try again.'
        });
    }
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
        
        // Step 5: Display the new product card on the page immediately
        displayProduct(data);
        
        // Update product count
        updateProductCount();
        
        // Step 6: Show success message to user
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Product added successfully!',
            timer: 2000,
            showConfirmButton: false
        });
        
        // Step 7: Close the modal after successful addition
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();
        
        // Step 8: Clear the form for next use
        document.getElementById('addProductForm').reset();
        
        // Step 9: Reset editing mode (in case it was set)
        editingProductId = null;
        document.getElementById('addProductModalLabel').textContent = 'Add New Product';
        document.getElementById('submitProductBtn').textContent = 'Add Product';
        
    } catch (error) {
        // Handle any errors during the add process
        console.error('Error adding product:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to add product. Please try again.'
        });
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
            
            // Step 4: Find and remove the product card from the page
            // Find the card with matching product ID using the data-product-id attribute
            const cardToDelete = document.querySelector(`[data-product-id="${productId}"]`);
            
            // If we found the card, remove it from the page
            if (cardToDelete) {
                cardToDelete.remove();
            }
            
            // Update product count
            updateProductCount();
            
            // Step 5: Show success message
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Product has been deleted successfully.',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            // If status is not 200, show error
            Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text: 'Failed to delete product. Please try again.'
            });
        }
        
    } catch (error) {
        // Handle any errors during the delete process
        console.error('Error deleting product:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to delete product. Please check your connection.'
        });
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
        
        // Step 3: Check if we're in Edit mode or Add mode
        if (editingProductId !== null) {
            // We're editing an existing product - call updateProduct
            updateProduct(editingProductId, title, description, price, category, thumbnail);
        } else {
            // We're adding a new product - call addProduct
            addProduct(title, description, price, category, thumbnail);
        }
    });
    
    // =====================================================
    // EVENT LISTENER: Reset form when modal is closed
    // =====================================================
    // This ensures the form is cleared when user closes modal without submitting
    const addProductModal = document.getElementById('addProductModal');
    addProductModal.addEventListener('hidden.bs.modal', function() {
        // Clear the form
        document.getElementById('addProductForm').reset();
        // Reset editing mode
        editingProductId = null;
        // Reset modal title
        document.getElementById('addProductModalLabel').textContent = 'Add New Product';
        // Reset button text
        document.getElementById('submitProductBtn').textContent = 'Add Product';
    });
});
