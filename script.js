function toggleMenu(){const n=document.getElementById('nav');if(n)n.style.display=n.style.display==='flex'?'none':'flex';}
const form=document.getElementById('bookingForm');
if(form){
form.addEventListener('submit',function(e){
e.preventDefault();
const name=document.getElementById('name').value;
const phone=document.getElementById('phone').value;
const service=document.getElementById('service').value;
const location=document.getElementById('location').value;
const date=document.getElementById('date').value;
const time=document.getElementById('time').value;
const message=document.getElementById('message').value;
const text=`Hello Bun Bun Hair Salon! I would like to make a booking.%0A%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0AService: ${encodeURIComponent(service)}%0ALocation: ${encodeURIComponent(location)}%0ADate: ${encodeURIComponent(date)}%0ATime: ${encodeURIComponent(time)}%0AMessage: ${encodeURIComponent(message)}`;
window.open(`https://wa.me/260971146826?text=${text}`,'_blank');
});
}
