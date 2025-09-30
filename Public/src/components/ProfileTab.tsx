import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { api } from "../api/api";

interface Props {
  currentUser:any;
}

export default function
ProfileTab({currentUser}:Props){
  const [nombre , setNombre]=useState(currentUser.nombre);
  const [apellido, setApellido]=useState(currentUser.apellido);
  const [email , setEmail] =useState(currentUser.email);
  const [photo  ,setPhoto] =useState<string | null>(currentUser.photoUrl || null);

  // selecionar nueva foto 

  const pickImage =async () =>{
    const result =await ImagePicker.launchImageLibraryAsync({
      mediaTypes:ImagePicker.MediaTypeOptions.Images,quality:0.7
    });
    if (!result.canceled && result.assets[0].uri){
      setPhoto(result.assets[0].uri);
    }
  };

  // guadar cambios
  const saveProfile =async () =>{
    try {
      let photoUrl =currentUser.photoUrl;
      //subir foto 
      if (photo && photo ! == currentUser.photoUrl){
        const formData =new FormData ();
        formData.append("file" ,{
          uri:photo,
          name:"profile.jpg",
          type:"image/jpeg",
        } as any );
        const res =await api.post("/upload", formData ,{
          headers:{
            "Content-Type":"multipart/form-data",
          },
        });
        photoUrl =res.data.url;
        }
        //actualizar 
        await api.put (`/users/${currentUser._id}`,{
          nombre,
          apellido,
          email ,
          photoUrl,
        });
        Alert.alert("Exito" , "Perfil actualizado correctamente")
        }catch (error) {
          console.error(error);
          Alert.alert ("Error" , "No se pudo actualizar el perfil")
        }
      };
      return (
        <View style={styles.container}>
          {photo && <Image source={{uri:photo}}style={styles.avatar}/>}
          <Button mode="outlined" onPress={pickImage} style={{marginBottom:15}}>Cambiar Foto</Button>
          <TextInput label="Nombre"  value ={nombre} onChangeText={setNombre} style={styles.input} />
          <TextInput label="Apellido" value={apellido} onChangeText={setApellido} style={styles.input}/>
          <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input}/>
          <Button mode ="contained" onPress={saveProfile} >Guardar cambios</Button>
        </View>
      );
    }

    const styles =StyleSheet.create ({
      container:{flex:1 , padding:20, backgroundColor:"#f5f5f5"},
      avatar:{width:120 , height:120 , borderRadius:60 , alignSelf:"center", marginBottom:15},
      input:{marginBottom:15 , backgroundColor:"#fff"},
    });
