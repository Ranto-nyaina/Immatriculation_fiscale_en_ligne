import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, BackHandler } from 'react-native';



const AboutContactScreen = () => {
  const handleLinkPress = (url) => {
    Linking.openURL(url).catch((err) => console.error());
  };

  
const navigation = useNavigation();

useEffect(() => {
  const backAction = () => {
    navigation.navigate('Menu'); // Retourner à l'écran précédent
    return true; // Empêcher le comportement par défaut
  };

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    backAction
  );

  return () => backHandler.remove(); // Nettoyer l'écouteur lors du démontage du composant
}, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Histoire:</Text>
      <Text style={styles.text}>
        Momba ny DGI Tantara fohy Taona 1975 ka hatramin'ny 1997. Ny foibem-pitatanana momba ny hetra sy ny Foibem-pitatanana ny fadintseranana dia notantanin’ny Foibem-pitatanana ankapobe iray natao hoe « Foibem-pitantanana ankapoben’ny Fitondran-draharaha ara-bola » (DGRF). Ny foibem-pitantanana miandraikitra ny hetra dia nizara sampan-draharaha telo saiky miavaka tsara : sampan-draharahan’ny hetra mivantana , sampan-draharahan’ny hetra tsy mivantana sy ny sampan-draharahan’ny fanoratana sy ny hajia . Tamin’ny taona 1998,dia nitsangana ny Foibempitantanana ankapobe momba ny hetra ( DGI ) ary tafaray ny...
      </Text>
      <Text style={styles.title}>A propos:</Text>
      <Text style={styles.text}>
        Foibem-pitantanana ankapoben'ny hetra - Tranoben'ny Ministera misahana ny toe-bola sy ny teti-bola Antaninarenina Antananarivo 101 - BP 863.
      </Text>
      
      <Text style={styles.title}>Contactez-nous</Text>
      <Text style={styles.text}>
        Pour toute question ou assistance, veuillez nous contacter via les liens ci-dessous :
      </Text>
      
      <TouchableOpacity onPress={() => handleLinkPress('mailto:dgimpots@moov.mg')} style={styles.link}>
        <Text style={styles.linkText}>dgimpots@moov.mg</Text>
      </TouchableOpacity>
        <View>
        <TouchableOpacity onPress={() => handleLinkPress('tel:2233550')} style={styles.link}>
            <Text style={styles.linkText}>22 335 50</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleLinkPress('tel:2228708')} style={styles.link}>
            <Text style={styles.linkText}>22 287 08</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleLinkPress('https://www.impots.mg')} style={styles.link}>
            <Text style={styles.linkText}>https://www.impots.mg</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.reseau}>
      <TouchableOpacity onPress={() => handleLinkPress('https://web.facebook.com/www.impots.mg?ref=bookmarks')} style={styles.linkIcon}>
        <Ionicons name="logo-facebook" size={40} color="#3b5998" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleLinkPress('https://x.com/impotsMada')} style={styles.linkIcon}>
        <Ionicons name="logo-twitter" size={40} color="#1DA1F2" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleLinkPress('https://plus.google.com/u/0/collection/MzP9cB')} style={styles.linkIcon}>
        <Ionicons name="logo-google" size={40} color="#DB4437" />
      </TouchableOpacity>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  text: {
    fontSize: 14,
    marginBottom: 20,
  },
  link: {
    marginBottom: 10,
  },
  linkText: {
    fontSize: 16,
    color: '#1379CD',
    textDecorationLine: 'underline',
  },
  reseau: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 30,
  },
  linkIcon: {
    marginHorizontal: 15,
  },
});

export default AboutContactScreen;
