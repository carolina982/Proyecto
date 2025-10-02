import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { api } from "../api/api";
import AnnouncementCard from "../components/AnnouncementCard";
import AnnouncementForm from "../components/AnnouncementForm";

interface Announcement{
    id:string;
    titulo:string;
    descripcion:string;
    fecha:string;
    autor:string;
}

export default function HomePage () {
    const [announcement, setAnnouncement]=useState<Announcement[]>([]);
    const [modalVisible , setModalVisible]=useState(false);
    const[editingAnnouncement , setEditingAnnouncement] =useState<Announcement | null>(null);

    const [userRole , setRole]=useState<"admin" | "user">("admin");
    useEffect(()=>{
        loadAnnouncements();
    },[]);

    const loadAnnouncements =async ()=>{
        try{
            const res=await api.get("/announcements");
            setAnnouncement(res.data.map((a:any)=>({...a,id:a._id})));
        }catch (error){
            console.error("Error cargamdo anuncios" , error );
            Alert.alert("Error" , "No se pudieron cargar los anuncios");
        }
    };
    const openModal =(announcement?: Announcement) =>{
        setEditingAnnouncement(announcement || null);
        setModalVisible(true);
    };
    const saveAnnouncement=async(data:Omit <Announcement,"id">)=>{
        try {
            if(announcement){
                await api.put(`/announcements/${editingAnnouncement.id}`, data);
            }else{
                await api.post("/announcements" , data);
            }
            await loadAnnouncements();
            setModalVisible(false);
        }catch (error){
            console.error("Error guardando anuncio", error);
            Alert.alert("Error" , "No se pudo guardar el anuncio");
        }
    };
    const deleteAnnouncement = async (id:string)=>{
        Alert.alert("Confirmar " , "¿Deseas eliminar este anuncio?" , [{text:"Cancelar " , style:"cancel}"},
            {
                text:"Eliminar",
                style:"destructive",
                onPress:async ()=>{
                    try{
                        await api.delete(`/announcements/${id}`);
                        await loadAnnouncements();
                    }catch (error){
                        console.error("Error eliminando anuncio", error);
                        Alert.alert("Error" , "No se pudo eliminar el anuncio")
                    }
                },
            },
        ]);
    };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Anuncios</Text>
            {userRole === "admin" &&(
                <Button mode="contained" buttonColor="#0b75bb" onPress={()=>openModal}>Nuevo anuncio</Button>
            )}
            <FlatList 
            data={announcement}
            keyExtractor={(item)=>item.id}
            renderItem={({item})=>(
                <AnnouncementCard announcement={item } onEdit={userRole === "admin"? ()=>openModal(item):undefined}
                    onDelete={userRole ==="admin"? ()=>deleteAnnouncement(item.id):undefined}
                    />
            )}
            style={{marginTop:15}}
            />
            <Modal visible={modalVisible} animationType="slide">
                <ScrollView style={styles.modalContent}>
                    <AnnouncementForm announcement={editingAnnouncement}
                    onSave={saveAnnouncement} 
                    onCancel={()=>setModalVisible(false )}
                    />
                </ScrollView>
            </Modal>
        
        </View>
    );
}

const styles= StyleSheet.create ({
    container:{flex:1 , padding:15, backgroundColor:"#f5f5f5"},
    title:{fontSize:24 , fontWeight:"bold" , marginBottom:15 , color:"#0d75bb"},
    modalContent :{flex:1 ,padding:20},
})