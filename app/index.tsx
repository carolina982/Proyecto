import { StyleSheet, Text, View } from "react-native";

export default function Index (){
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Volata app funcionando</Text>
        </View>
    );
}


const styles=StyleSheet.create({
    container:{flex:1, alignItems:"center",justifyContent:"center"},
    text:{fontSize:20 ,fontWeight:"bold"}
});