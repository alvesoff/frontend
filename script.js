// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a, .footer-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only apply to links that point to an ID on the page
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Offset for header
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Mobile menu toggle functionality could be added here if needed
    
    // Add animation to elements when they come into view
    const animateOnScroll = function() {
        const features = document.querySelectorAll('.feature');
        const resourceCards = document.querySelectorAll('.resource-card');
        
        // Simple function to check if element is in viewport
        const isInViewport = function(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
                rect.bottom >= 0
            );
        };
        
        // Add animation class when elements come into view
        const addAnimationClass = function(elements, className) {
            elements.forEach(element => {
                if (isInViewport(element) && !element.classList.contains(className)) {
                    element.classList.add(className);
                }
            });
        };
        
        // Apply animations
        addAnimationClass(features, 'animate-fade-in');
        addAnimationClass(resourceCards, 'animate-fade-in');
    };
    
    // Run on scroll and on load
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
});

// Add animation classes to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    .animate-fade-in {
        animation: fadeIn 0.8s ease forwards;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
