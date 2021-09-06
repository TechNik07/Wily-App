import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Image, Alert, KeyboardAvoidingView, ToastAndroid } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions'
import { TextInput } from 'react-native-gesture-handler';
import * as firebase from 'firebase';
import db from '../config.js';

export default class BookTransactionScreen extends React.Component {

    constructor(){

        super()
        this.state={
            hasCameraPermissions:null,
            scanned:false,
            scannedBookID:'',
            scannedstudentID:'',
            buttonState:"normal",
            transactionMessage: ''
        }

    }

    getCameraPermissions=async(id)=>{

        const {status}=await Permissions.askAsync(Permissions.CAMERA);
        this.setState({

            hasCameraPermissions:status==="granted",
            buttonState:id,
            scanned:false

        });

    }

    handleBarcodeScan=async({type,data})=>{

        const {buttonState}=this.state

        if(buttonState === "bookID"){

            this.setState({scanned:true,
                scannedBookID:data,
                buttonState:"normal"})

        }else if(buttonState === "studentID"){

            this.setState({scanned:true,
                scannedStudentID:data,
                buttonState:"normal"})

            }

    }

    initiateBookIssue=async()=>{

        db.collection("transactions").add({

            'studentID':this.state.scannedStudentID,
            'bookID':this.state.scannedBookID,
            'date':firebase.firestore.Timestamp.now().toDate(),
            'transactionType':"Issue"

        })

        db.collection("books").doc(this.state.scannedBookID).update({

            'bookAvailability':false

        })

        db.collection("students").doc(this.state.scannedStudentID).update({


            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)

        })

        
        this.setState({
            scannedBookID:"",scannedStudentID:""
        })
        Alert.alert("Book Issued")

    }

    initiateBookReturn=async()=>{

        db.collection("transactions").add({

            'studentID':this.state.scannedStudentID,
            'bookID':this.state.scannedBookID,
            'date':firebase.firestore.Timestamp.now().toDate(),
            'transactionType':"Return"

        })

        db.collection("books").doc(this.state.scannedBookID).update({

            'bookAvailability':true

        })

        db.collection("students").doc(this.state.scannedStudentID).update({


            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)

        })

        
        this.setState({
            scannedBookID:"",scannedStudentID:""
        })
        Alert.alert("Book Returned")

    }

    checkBookEligibility=async()=>{

        const bookRef=await db.collection("books").where("bookID","==",this.state.scannedBookID).get()
        var transactionType=""
        if(bookRef.docs.length==0){

            transactionType=false
            console.log(bookRef.docs.length)

        }else{

            bookRef.docs.map((doc)=>{

                var book=doc.data()
                if(book.bookAvailability){
                    transactionType="Issue"
                }else{
                    transactionType="Return"
                }

            })

        }
        return transactionType
    }

    checkStudentEligibilityForBookIssue=async()=>{

        const studentRef=await db.collection("students").where("studentID","==",this.state.scannedstudentID).get()
        var isStudentEligible=""
        if(studentRef.docs.length==0){
            this.setState({
                scannedStudentID:'',scannedBookID:''
            })
            isStudentEligible=false
            Alert.alert("Student ID doen't exist in the database!")
        }else{
            studentRef.docs.map((doc)=>{
                var student = doc.data()
                if(student.numberOfBooksIssued<2){
                    isStudentEligible=true
                }else{
                    isStudentEligible=false
                    
                    this.setState({
                        scannedBookID:'',scannedStudentID:''
                    })
                    Alert.alert("The student has issued 2 books!")
                }
            })
        }

        return isStudentEligible

    }

checkStudentEligibilityForBookReturn=async()=>{

        const transactionRef=await db.collection("transactions").where("bookID","==",this.state.scannedBookID).limit(1).get()
        var isStudentEligible=""
        transactionRef.docs.map((doc)=>{
            var lastBookTransaction=doc.data()
            if(lastBookTransaction.studentID===this.state.scannedstudentID){

                isStudentEligible=true

            }else{

                isStudentEligible=false
                
                this.setState({
                    scannedBookID:'',scannedStudentID:''
                })
                Alert.alert("Book wasn't issued by this student")
            }
        })
        
        return isStudentEligible

    }
        
    handleTransaction=async()=>{

        
            var transactionType = await this.checkBookEligibility()
            console.log("-----TransactionType----",transactionType)
            if(!transactionType){
                Alert.alert("book doen't in the database!")
                this.setState({
                    scannedStudentID:'',scannedBookID:''
                })
                

            }else if(transactionType==="Issue"){

                var isStudentEligible=await this.checkStudentEligibilityForBookIssue()
                if(isStudentEligible){
                    this.initiateBookIssue()
                    Alert.alert("Book issued to the student!")
                }

            }else{

                var isStudentEligible = await this.checkStudentEligibilityForBookReturn()
                if(isStudentEligible){
                    this.initiateBookReturn()
                    Alert.alert("Book returned to the library!")
                }

            }

        }

    render(){

        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;
        if(buttonState !== "normal" && hasCameraPermissions){

            return(

                <BarCodeScanner onBarCodeScanned = {scanned ? undefined:this.handleBarcodeScan}style={StyleSheet.absoluteFillObject}
                ></BarCodeScanner>

            )

        }else if(buttonState === "normal"){

            return (

                <KeyboardAvoidingView style = {styles.container} behavior="padding" enabled>
                    <View>
                        <Image source={require("../assets/booklogo.jpg")} style={{width:200,height:200}}></Image>
                        <Text style={{textAlign:'center',fontSize:30}}>Willy</Text>
                    </View>
                    <View style={styles.inputView}>

                        <TextInput style={styles.inputBox}placeholder="Book ID" value={this.state.scannedBookID} 
                        onChangeText={text=>this.setState({scannedBookID:text})}></TextInput>
                           
                            <TouchableOpacity style={styles.scanButton} 
                            onPress={()=>{this.getCameraPermissions("bookID")}}>
                                <Text style={styles.buttonText}>Scan</Text>
                            </TouchableOpacity>
                    </View>

                    <View style={styles.inputView}>
                   
                            <TextInput style={styles.inputBox}placeholder="Student ID" value={this.state.scannedStudentID} 
                            onChangeText={text=>this.setState({scannedStudentID:text})}></TextInput>
                            
                            <TouchableOpacity style={styles.scanButton} 
                             onPress={()=>{this.getCameraPermissions("studentID")}}>
                                <Text style={styles.buttonText}>Scan</Text>
                            </TouchableOpacity>

                     </View>
                     <Text style={styles.transactionAlert}>{this.state.transactionMessage}</Text>
                    <TouchableOpacity style={styles.submitButton} 
                    onPress={async()=>{var transactionMessage = this.handleTransaction();
                        console.log("transaction message: ", transactionMessage)
                    this.setState({scannedBookID:'',scannedStudentID:''})}}>

                        <Text style={styles.submitButtonText}>Submit</Text>

                    </TouchableOpacity>
        
                </KeyboardAvoidingView>
        
            )

        }

}

}

const styles = StyleSheet.create({

    container:{flex:1, justifyContent: 'center', alignItems: 'center'},
    displayText: {fontSize: 15, textDecorationLine:'underline'},
    scanButton:{backgroundColor:'cyan',padding:10, margin:10},
    buttonText:{fontSize:15,textAlign:'center'},
    inputView:{flexDirection:'row',margin:20},
    inputBox:{width:200,height:30,borderWidth:1.5,fontSize:15},
    scanButton:{backgroundColor:'cyan',width:50,borderWidth:1.5},
    submitButton:{backgroundColor:'red',width:50,height:50},
    submitButtonText:{
        padding: 10,
        textAlign: 'center',
        fontSize: 20,
        fontWeight:"bold",
        color: 'white'
      },
      transactionAlert:{
        margin:10,
        color: 'red'
      }
})