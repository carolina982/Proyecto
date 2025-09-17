import { StyleSheet } from "react-native";
import UnitList from "../components/UnitList";


export default function  UnitsPage (){
    return (
        <view style={styles.container}>
            <UnitList/>
        </view>
    );
}

 const styles =StyleSheet.create ({
    container : {flex :1 ,padding:10, backgroundColor :"#fff"},
 });