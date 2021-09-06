import React from 'react';
import { Text, View  } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import db from '../config'

export default class SearchScreen extends React.Component {

    constructor(props){

        super(props);
        this.state={
            allTransactions:[]
        }

    }

    componentDidMount=async()=>{

        const query=await db.collection("transactions").get()
        query.docs.map((doc)=>{

            this.setState({
                allTransactions:[this.state.allTransactions,doc.data()]
            })

        })

    }

render(){

    return (

        <ScrollView>
            {this.state.allTransactions.map((Transaction,index)=>{

                return(

                    <View key={index} style={{borderBottomWidth:2}}>
                        <Text>{"BookID"+Transaction.bookID}</Text>
                        <Text>{"StudentID"+Transaction.studentID}</Text>
                        <Text>{"TransactionType"+Transaction.transactionType}</Text>
                        {/* <Text>{"Date"+Transaction.date.toDate()}</Text> */}
                    </View>

                )

            })}
        </ScrollView>

    )

}

}