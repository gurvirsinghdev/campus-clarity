import { Stack } from 'expo-router';
import * as React from 'react';
import { Poppins_400Regular, useFonts } from '@expo-google-fonts/poppins';
import {
  View,
  Text as NativeText,
  TextInput,
  TouchableOpacity,
  ViewBase,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Loader2Icon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface SchoolSearchValidAPIResponse {
  schools: {
    canonicalName: string;
    canonicalCountry: string;
    branches: {
      id: string;
      cursor: string;
      name: string;
      city: string;
      state: string;
    }[];
  }[];
}

const apiBaseUrl = 'https://thetic-nonfashionably-sandy.ngrok-free.dev/api';

export default function MainScreen() {
  const [fontLoaded] = useFonts({
    Poppins: Poppins_400Regular,
  });

  const colorScheme = useColorScheme();
  colorScheme.setColorScheme('light');

  const [loading, setLoading] = React.useState(false);
  const [controller, setController] = React.useState<AbortController | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string | null>(null);
  const [schoolsData, setSchoolsData] = React.useState<SchoolSearchValidAPIResponse | null>(null);

  const fetchSchools = async function (signal: AbortSignal) {
    setLoading(true);
    const schoolsSearchEndpoint =
      apiBaseUrl + '/schools/search?q=' + (searchQuery || 'University of');
    try {
      const response = await fetch(schoolsSearchEndpoint, { signal });
      const json = await response.json();
      if (json && Array.isArray(json?.schools)) setSchoolsData(json);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(
    function () {
      if (controller) controller.abort();
      const newController = new AbortController();
      setController(newController);
      fetchSchools(newController.signal);
    },
    [searchQuery]
  );

  if (!fontLoaded) return null;
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'CampusClarity',
          headerTitleStyle: {
            fontFamily: 'Poppins',
          },
        }}
      />

      <View className="-mt-4 h-screen w-screen bg-neutral-100 p-4 pt-0">
        <StatusBar style="dark" />
        <SafeAreaView className="flex flex-col gap-8">
          <View className="flex flex-col gap-2">
            <View>
              <TouchableOpacity>
                <TextInput
                  className="border border-border bg-white p-4"
                  style={{ fontFamily: 'Poppins' }}
                  placeholder="Search School"
                  value={searchQuery || ''}
                  onChangeText={setSearchQuery}
                />
              </TouchableOpacity>
            </View>

            {/* Generic Listing for Schools */}
            <View>
              <Text style={{ fontFamily: 'Poppins' }} className="text-sm">
                Unable to find your school? Use the search bar above.
              </Text>
            </View>
          </View>

          <ScrollView>
            <View className="flex flex-col gap-2 pb-48">
              {schoolsData && schoolsData.schools.length == 0 && (
                <Text style={{ fontFamily: 'Poppins' }}>No schools found!</Text>
              )}
              {schoolsData &&
                schoolsData.schools.map((school, idx) => (
                  <View key={idx} className="border border-border bg-white p-4">
                    <Text style={{ fontFamily: 'Poppins' }}>{school.canonicalName}</Text>
                    <View className="flex flex-row items-center justify-between">
                      <View>
                        <Badge>
                          <Text className="text-xs">{school.canonicalCountry}</Text>
                        </Badge>
                      </View>

                      <View>
                        <Text>{school.branches.map((branch) => branch.state).join(', ')}</Text>
                      </View>
                    </View>
                  </View>
                ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
}
