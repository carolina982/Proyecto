import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Platform } from "react-native";

export function ExternalLink (props:React.ComponentProps <typeof Link>){
  return (
    <Link 
    target="_blank"
    {...props}
    href={props.href}
    onPress={(e)=>{
      if (Platform.OS !== `web` ){
        //evita el link intente abriser como html
        e.preventDefault();
        //abre el navegador nativo 
        WebBrowser.openBrowserAsync(props.href as string);
      }
    }}
    />
  );
}
