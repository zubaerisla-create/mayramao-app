import React, { Component } from 'react'
import { Button, Text, View } from 'react-native'

export default class VerifySuccess extends Component {
    render() {
        return (
            <View>
                <Text>Congratulations!</Text>
                <Text>Your account has been created successfully</Text>
                <Button title='Continue Login' ></Button>
            </View>
        )
    }
}