document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded with JavaScript!')
    const incrementButton = document.getElementById('incrementButton');
    const counterElement = document.getElementById('counter');
    let counter = 0;
    incrementButton.addEventListener('click', () => {
        counter++;
        counterElement.innerHTML = counter;
    });
});
