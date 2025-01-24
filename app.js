// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAIJC9U_FbqF2p1v4oKZFsUQLYJYO-gLjk",
    authDomain: "agawnteam.firebaseapp.com",
    projectId: "agawnteam",
    storageBucket: "agawnteam.appspot.com",
    messagingSenderId: "1043719591547",
    appId: "1:1043719591547:web:911d4ce93c73335576f4de"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Form submission handler
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const image1 = document.getElementById('image1').files[0];
    const image2 = document.getElementById('image2').files[0];
    const description = document.getElementById('description').value;

    try {
        // Upload images to storage
        const image1Ref = storage.ref(`gallery/${Date.now()}_${image1.name}`);
        const image2Ref = storage.ref(`gallery/${Date.now()}_${image2.name}`);

        const [image1Snapshot, image2Snapshot] = await Promise.all([
            image1Ref.put(image1),
            image2Ref.put(image2)
        ]);

        const [image1URL, image2URL] = await Promise.all([
            image1Snapshot.ref.getDownloadURL(),
            image2Snapshot.ref.getDownloadURL()
        ]);

        // Save to Firestore
        await db.collection('galleryUploads').add({
            image1URL,
            image2URL,
            description,
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
        modal.hide();
        e.target.reset();

        // Reload gallery
        loadGalleryImages();
        alert('Images uploaded successfully!');
    } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed. Please try again.');
    }
});

// Load gallery images
function loadGalleryImages() {
    const galleryContainer = document.getElementById('gallery-container');
    
    db.collection('galleryUploads').get().then((snapshot) => {
        galleryContainer.innerHTML = ''; // Clear existing images
        
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            
            // Create wrapper for image 1
            const wrapper1 = createImageWrapper(data.image1URL);
            galleryContainer.appendChild(wrapper1);
            
            // Create wrapper for image 2
            const wrapper2 = createImageWrapper(data.image2URL);
            galleryContainer.appendChild(wrapper2);
        });
    });
}

// Create image wrapper
function createImageWrapper(imageUrl) {
    const wrapper = document.createElement('div');
    wrapper.className = 'gallery-image-wrapper';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'gallery-image';
    
    wrapper.appendChild(img);
    return wrapper;
}

// Initial load
window.onload = loadGalleryImages;