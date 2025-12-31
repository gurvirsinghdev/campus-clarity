import { Poppins_400Regular, useFonts } from "@expo-google-fonts/poppins";
import { Text, View } from "react-native";
import "./global.css";

export default function App() {
  const [fontLoaded, fontError] = useFonts({
    Poppins: Poppins_400Regular,
  });

  if (!fontLoaded) {
    return null;
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text
        className="text-xl font-bold text-blue-500"
        style={{ fontFamily: "Poppins" }}
      >
        Welcome to Nativewind!
      </Text>
    </View>
  );
}
