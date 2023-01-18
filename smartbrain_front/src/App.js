import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import ParticlesBg from 'particles-bg'
import React,{ Component } from 'react';
import Clarifai from 'clarifai';


const app = new Clarifai.App({
  apiKey: 'e23549d6b2524f0d8a0a4042d4c3f18e'
 });

class App extends Component{
  
  constructor(){
    super();
    this.state={
      input:'',
      imageUrl:'',
      box: {},
      route : 'signIn',
      isSignedIn: false,
      user: {
        id:'',
        name:'',
        email:'',
        entries: 0,
        joined:''
      }
    }
  }

  loadUser =(data)=>{
    this.setState({user:{
      id:data.id,
      name:data.name,
      email:data.email,
      entries: data.entries,
      joined:data.joined
    }})
  }

  onInputChange = (event)=>{
    this.setState({input:event.target.value});
  }

  calculateFaceLocation =(data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inpimg');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width,height)
    return{
      leftCol : clarifaiFace.left_col * width,
      topRow :clarifaiFace.top_row * height,
      rightCol : width - (clarifaiFace.right_col * width),
      bottomRow : height - (clarifaiFace.bottom_row * height)
    }
}

displayFaceBox = (box) => {
  console.log(box)
  this.setState({box : box})
}

onButtonDetect = () =>{
  console.log("Click");
  this.setState({imageUrl: this.state.input})
  app.models
    .predict(
      {
        id: 'face-detection',
        name: 'face-detection',
        version: '6dc7e46bc9124c5c8824be4822abe105',
        type: 'visual-detector',
      }, this.state.input)
    .then(response => {
      if(response){
        fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              email: this.state.user.email
            })
          })
            .then(response => response.json())
            .then(user => {
              this.setState(Object.assign(this.state.user, { 
                entries: user.entries}))
              console.log(this.state.user.entries)
            })
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) =>{
    console.log(route)
    if(route ===  'signout' || route === 'signIn')
    {
      this.setState({isSignedIn : false})
    }
    else if(route === 'home')
    {
        this.setState({isSignedIn:true})
    }
    this.setState({route : route})
  }

  render() {
    const {isSignedIn, imageUrl, route, box} = this.state;
    return (
      <div className="App">
        <ParticlesBg type="cobweb" bg={true} />
        <Navigation isSignedIn={isSignedIn}onRouteChange ={this.onRouteChange}/>
        {
          isSignedIn 
        ? <div>
          <Logo/>
          <Rank 
          name={this.state.user.name}
          entries={this.state.user.entries}/>
          <ImageLinkForm onInputChange={this.onInputChange} onButtonDetect={this.onButtonDetect}/>
          <FaceRecognition box={box} imageUrl = {imageUrl}/>
        </div> 
        :(
          route === 'signIn'
          ?<SignIn loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/>
          : <Register onRouteChange={this.onRouteChange}/>
        ) 
        }
      </div>
    );
  }

}
export default App;
