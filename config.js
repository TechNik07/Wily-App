import firebase from 'firebase';
require('@firebase/firestore');

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCQMvrAzRRdLiKoaXQWmIDmkdSEI8ZrVjw",
    authDomain: "willy-app-c802e.firebaseapp.com",
    projectId: "willy-app-c802e",
    storageBucket: "willy-app-c802e.appspot.com",
    messagingSenderId: "514734296229",
    appId: "1:514734296229:web:1a8bc8fbdda971daaa514c"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();