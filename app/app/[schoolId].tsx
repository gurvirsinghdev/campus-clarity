import { Text } from '@/components/ui/text';
import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

export default function SchoolScreen() {
  const { schoolId } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'School Name',
          headerTitleStyle: {
            fontFamily: 'Poppins',
          },
          headerBackButtonDisplayMode: 'minimal',
        }}
      />

      <View className="p-4">
        <Text style={{ fontFamily: 'Poppins' }}>
          Server is not capable of listing a school from it's ID.
        </Text>
      </View>
    </>
  );
}
