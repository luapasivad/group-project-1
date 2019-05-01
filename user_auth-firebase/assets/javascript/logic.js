  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCD271LKYaN3Lf-Frce1ZTu0-z5SEuahDk",
    authDomain: "authentication-test-1eca2.firebaseapp.com",
    databaseURL: "https://authentication-test-1eca2.firebaseio.com",
    projectId: "authentication-test-1eca2",
    storageBucket: "authentication-test-1eca2.appspot.com",
    messagingSenderId: "319487003193"
  };
  firebase.initializeApp(config);

  //Get elements
  const emailTxt = $('#emailTxt')
  const passTxt = $('#passTxt')
  const btnLogin = $('#btnLogin')
  const btnSignUp = $('#btnSignUp')
  const btnLogOut = $('#btnLogOut')
  const database = firebase.database()

  //add login event
  btnLogin.on('click', e => {
      const user = emailTxt.val()
      const pass = passTxt.val()
      const auth = firebase.auth();
      // sign in
     const promise = auth.signInWithEmailAndPassword(user, pass);
     promise.catch(e => console.log(e.message))

  })
  // sign up
  btnSignUp.on('click', e => { 
    const user = emailTxt.val()
    const pass = passTxt.val()
    const auth = firebase.auth();
    // sign in
   const promise = auth.createUserWithEmailAndPassword(user, pass);
   promise.catch(e => console.log(e.message))
  })
//log out
btnLogOut.on('click', e => {
    firebase.auth().signOut();
})

firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser) {
        console.log(firebaseUser)
    }else{
        console.log('not logged in')
    }
})