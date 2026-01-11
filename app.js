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
// LOCAL STORAGE - To persist products on the browser
// =====================================================
// Local products array - stores all products in memory
let localProducts = [];

// Helper function: Get products from localStorage
function getLocalProducts() {
    const stored = localStorage.getItem('shopManageProducts');
    return stored ? JSON.parse(stored) : null;
}

// Helper function: Save products to localStorage
function saveLocalProducts(products) {
    localStorage.setItem('shopManageProducts', JSON.stringify(products));
    localProducts = products;
}

// =====================================================
// FUNCTION: Fetch Products from API or Local Storage
// =====================================================
// This function loads products from localStorage or fetches from API on first load
async function fetchProducts() {
    try {
        // Step 1: Check if we have products in localStorage
        const storedProducts = getLocalProducts();
        
        if (storedProducts && storedProducts.length > 0) {
            // Step 2a: Load from localStorage (faster, offline support)
            localProducts = storedProducts;
            productContainer.innerHTML = '';
            
            localProducts.forEach(product => {
                displayProduct(product);
            });
            
            updateProductCount();
        } else {
            // Step 2b: No local data, fetch from API (first time load)
            productContainer.innerHTML = `
                <div class="col-12 text-center mt-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3">Loading products...</p>
                </div>
            `;

            // Step 3: Fetch data from API using fetch with async/await
            const response = await fetch('https://dummyjson.com/products?limit=10');
            
            // Step 4: Convert response to JSON format
            const data = await response.json();
            
            // Step 5: Save to localStorage for future use
            saveLocalProducts(data.products);
            
            // Step 6: Clear the loading message
            productContainer.innerHTML = '';
            
            // Step 7: Loop through each product and display
            localProducts.forEach(product => {
                displayProduct(product);
            });
            
            // Update product count in hero section
            updateProductCount();
        }
        
    } catch (error) {
        // Step 8: Handle any errors that occur during fetch
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
    // Truncate description to 80 characters for card display
    const shortDescription = product.description && product.description.length > 80 
        ? product.description.substring(0, 80) + '...' 
        : product.description || 'No description available';
    
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
                
                <!-- Product Description -->
                <p class="card-text text-muted small">${shortDescription}</p>
                
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
// This function gets product data from local storage and opens the modal with pre-filled data
function editProduct(productId) {
    try {
        // Step 1: Find the product in local storage array
        const product = localProducts.find(p => p.id === productId);
        
        // Step 2: Check if product was found
        if (!product) {
            Swal.fire({
                icon: 'error',
                title: 'Product Not Found',
                text: 'Could not find this product in local storage.'
            });
            return;
        }
        
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
        
        // Step 6: Change the submit button text to 'Update Product'
        document.getElementById('submitProductBtn').textContent = 'Update Product';
        
        // Step 7: Open the modal
        const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
        modal.show();
        
    } catch (error) {
        // Handle any errors
        console.error('Error loading product for edit:', error);
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
// Note: We still call the API to demonstrate proper REST practices,
// but since DummyJSON doesn't persist data, we manage everything via localStorage
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
            // Step 4: Find the product in local array and update it
            const productIndex = localProducts.findIndex(p => p.id === productId);
            
            if (productIndex !== -1) {
                // Step 5: Update the product in local array
                localProducts[productIndex] = {
                    id: productId,
                    title: title,
                    description: description,
                    price: price,
                    category: category,
                    thumbnail: thumbnail
                };
                
                // Step 6: Save to localStorage
                saveLocalProducts(localProducts);
                
                // Step 7: Log the result
                console.log('Product updated successfully:', localProducts[productIndex]);
                
                // Step 8: Update the UI - remove old card
                const oldCard = document.querySelector(`[data-product-id="${productId}"]`);
                if (oldCard) {
                    oldCard.remove();
                }
                
                // Then, display the updated product card
                displayProduct(localProducts[productIndex]);
            }
            
            // Step 9: Show success message to user
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Product updated successfully!',
                timer: 2000,
                showConfirmButton: false
            });
            
            // Step 10: Close the modal after successful update
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
            modal.hide();
            
            // Step 11: Clear the form and reset editing mode
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
        // Note: The API response is not persisted by DummyJSON, so we manage data locally
        const response = await fetch('https://dummyjson.com/products/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData) // Convert JavaScript object to JSON string
        });
        
        // Step 3: Check if the response status is successful (200-299 range)
        if (response.ok) {
            // Step 4: Generate a unique ID for the new product
            // Find the highest ID in local products and add 1
            const newId = localProducts.length > 0 
                ? Math.max(...localProducts.map(p => p.id)) + 1 
                : 101;
            
            // Step 5: Create the complete product object
            const newProduct = {
            id: newId,
            title: title,
            description: description,
            price: price,
            category: category,
            thumbnail: thumbnail
        };
        
        // Step 6: Add to local products array
        localProducts.push(newProduct);
        
        // Step 7: Save to localStorage
        saveLocalProducts(localProducts);
        
        // Step 8: Log the result
        console.log('Product added successfully:', newProduct);
        
        // Step 9: Display the new product card on the page immediately
        displayProduct(newProduct);
        
        // Step 10: Update product count
        updateProductCount();
        
        // Step 11: Show success message to user
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Product added successfully!',
            timer: 2000,
            showConfirmButton: false
        });
        
        // Step 12: Close the modal after successful addition
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();
        
        // Step 13: Clear the form for next use
        document.getElementById('addProductForm').reset();
        
        // Step 14: Reset editing mode (in case it was set)
        editingProductId = null;
        document.getElementById('addProductModalLabel').textContent = 'Add New Product';
        document.getElementById('submitProductBtn').textContent = 'Add Product';        } else {
            // If status is not ok, show error
            Swal.fire({
                icon: 'error',
                title: 'Add Failed',
                text: 'Failed to add product. Please try again.'
            });
        }        
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
            // Step 3: Remove product from local array
            localProducts = localProducts.filter(p => p.id !== productId);
            
            // Step 4: Save updated array to localStorage
            saveLocalProducts(localProducts);
            
            // Step 5: Log the result
            console.log('Product deleted successfully from local storage');
            
            // Step 6: Find and remove the product card from the page
            const cardToDelete = document.querySelector(`[data-product-id="${productId}"]`);
            
            // If we found the card, remove it from the page
            if (cardToDelete) {
                cardToDelete.remove();
            }
            
            // Step 7: Update product count
            updateProductCount();
            
            // Step 8: Show success message
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
