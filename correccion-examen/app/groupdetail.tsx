import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { Button, Text, TextInput, View, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login, token } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([
    {
      id: "e.id1",
      desc: "e.description",
      amount: "e.amount",
      paid_by: "e.paid_by",

    }, {
      id: "e.id2",
      desc: "e.description",
      amount: "e.amount",
      paid_by: "e.paid_by",

    }, {
      id: "e.id3",
      desc: "e.description",
      amount: "e.amount",
      paid_by: "e.paid_by",

    },
  ]);
  const router = useRouter();

  const handleDelete = (id: string) => {
    console.log(`Borro el id : ${id}`);
    for (let i = 0; i < expenses.length; i++) {
      console.log(expenses[i]);
      if (expenses[i].id == id) {
        expenses.splice(i, 1);
        setExpenses([...expenses]);
      }
    }
    Alert.alert("Voy a borrar.");
  };

  const handleEdit = (id: string) => {
    for (let i = 0; i < expenses.length; i++) {
      const element = expenses[i];
      if (element.id == id) {
        Alert.alert(`${element.amount} - ${element.desc}`)
      }
    }
    Alert.alert("Voy a editar.");
  };

  const handleChange = (index: number, field: string, text: string) => {

  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text>Mi grupo</Text>
      {expenses.map((e, index) => (
        <View key={e.id}>
          <TextInput keyboardType="number-pad" onChangeText={(text) => handleChange(index, "amount", text)}>{e.amount}</TextInput>
          <TextInput>{e.desc}</TextInput>
          <Button title="Actualizar" onPress={() => handleEdit(e.id)} />
          <Button title="Borrar" onPress={() => handleDelete(e.id)} />
        </View>
      ))}

      <Button title="Volver a mis grupos" onPress={() => router.replace("/")} />
    </View>
  );
}
