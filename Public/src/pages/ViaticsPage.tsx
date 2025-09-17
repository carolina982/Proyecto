import { StyleSheet, View } from "react-native";
import ViaticList from "../components/ViaticList";
export default function ViaticsPage (){
 return (
    <View style ={styles.container} >
        <ViaticList/>
    </View>
 );
}

const styles =StyleSheet.create({
    container : {flex :1 ,padding :10 ,backgroundColor :"#fff"},
});