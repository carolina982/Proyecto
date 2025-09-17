import { StyleSheet, View } from "react-native";
import TripList from "../components/TripList";

export default function TripsPage () {
   

    return (
    <View style={styles.container}>
        <TripList/>
    </View>
  );
}

const styles =StyleSheet.create ({
    container :{flex :1 , padding :10 , backgroundColor :"#fff"},

});