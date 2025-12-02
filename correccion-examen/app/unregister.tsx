import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { unregister } = useContext(AuthContext);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleUnregister = async () => {
    const res = await unregister(username, password);
    if (res.ok) {
      router.replace("/login");
    } else {
      setError(res.msg || "No se pudo eliminar la cuenta");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <TextInput
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      <Button color="red" title="Borrar Cuenta" onPress={handleUnregister} />
      <Button title="Cancelar" onPress={() => router.push("/")} />
    </View>
  );
}