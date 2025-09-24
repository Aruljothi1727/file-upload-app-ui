import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Platform, Alert, ActivityIndicator, FlatList } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Card, List, Provider as PaperProvider } from 'react-native-paper';
import { API_URL_WEB, API_URL_ANDROID } from "@env";

const API_BASE_URL = Platform.OS === "web" ? API_URL_WEB : API_URL_ANDROID;


export default function App() {
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pick a file
  const pickFile = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf';
      input.onchange = () => {
        const selectedFile = input.files[0];
        if (!selectedFile) return;
        setFile(selectedFile);
      };
      input.click();
    } else {
      const result = await DocumentPicker.getDocumentAsync({

      });

      setFile(result.assets[0]);
    }
  };

  // Upload the selected file
  const uploadFile = async () => {
    if (!file) {
      Alert.alert('No file selected', 'Please choose a file first.');
      return;
    }
    setLoading(true);
    const formData = new FormData();

    if (Platform.OS === 'web') {
      formData.append('file', file);
    } else {
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: 'application/pdf',
      });
    }

    try {
      // Use your PC IP for Android emulator
     const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const jsonResponse = await response.json();
      console.log('Uploading file:', file.name, file.size || 'N/A');
      console.log('Response:', jsonResponse);

      if (response.ok) {
        Alert.alert('Success', 'File uploaded successfully!');
        setUploadedFile((prev) => [...prev, { id: Date.now().toString(), name: file.name }]);
        setFile(null)

      } else {
        Alert.alert('Upload failed', `Server responded with ${response.status}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Something went wrong during upload.');
    }
    setLoading(false);
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Card style={styles.headerCard}>
          <Card.Title title="Upload a PDF File" titleStyle={styles.headerText} />
        </Card>
        <View style={styles.buttonRow}>
          <Button title="Choose File" onPress={pickFile} />
          <Button title="Upload File" onPress={uploadFile} disabled={!file || loading} />
        </View>
       {file && (
          <Card style={styles.selectedFile}>
            <Text style={styles.fileText}>Selected File: {file.name}</Text>
          </Card>
        )}
         {loading && <ActivityIndicator size="large" color="lightblue" style={{ marginTop: 10 }} />}
        <View style={{ marginTop: 20,width: '100%', }}>
          {uploadedFile.length > 0 && (
             <Text style={styles.uploadedTitle}>Uploaded Files</Text>
          )}
          <FlatList
            data={uploadedFile}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Card style={styles.fileCard}>
                <List.Item title={`File ${index + 1}`} description={item.name} />
              </Card>
            )}
          />
        </View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  headerCard: {
    marginBottom: 20,
    width: '50%',
    alignSelf: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000ff',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    width: '100%',
  },
  selectedFile: {
    marginTop: 10,
    padding: 10,
    width: '90%',
    alignSelf: 'center',
  },
  fileText: {
    fontSize: 16,
    color: '#000000ff',
  },
  uploadedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000ff',
    marginBottom: 10,
  },
  fileCard: {
    marginVertical: 5,
  },
});
