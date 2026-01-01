import { Stack } from 'expo-router';
import * as React from 'react';
import { Poppins_400Regular, useFonts } from '@expo-google-fonts/poppins';
import { View, TextInput, ScrollView, Platform, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, SearchIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { cn } from '@/lib/utils';
import { THEME } from '@/lib/theme';

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
// const apiBaseUrl = 'http://localhost:8000/api';

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

      <View
        className={cn(
          'h-screen w-screen bg-neutral-100 p-4',
          Platform.select({
            native: '-mt-4 pt-0',
          })
        )}>
        <StatusBar style="dark" />
        <SafeAreaView className="flex-col gap-8">
          <View className="flex-col gap-2">
            <View style={{ position: 'relative' }}>
              <SearchIcon
                style={{
                  zIndex: 10,
                  left: 8,
                  top: '50%',
                  position: 'absolute',
                  transform: [{ translateY: '-50%' }, { scale: 0.9 }],
                  // @ts-expect-error Valid; However, types aren't compatible.
                  color: THEME.light.border,
                }}
              />
              <TextInput
                className="rounded-md border border-border bg-white p-4 pl-8"
                style={{ fontFamily: 'Poppins' }}
                placeholder="Search University..."
                value={searchQuery || ''}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Generic Listing for Schools */}
            {!searchQuery && (
              <View>
                <Text style={{ fontFamily: 'Poppins' }} className="text-sm">
                  Unable to find your university in the default list? Use the search bar above.
                </Text>
              </View>
            )}
          </View>

          <ScrollView>
            <View className="flex-col gap-4 pb-48">
              {schoolsData && schoolsData.schools.length == 0 && (
                <Text style={{ fontFamily: 'Poppins' }}>No schools found!</Text>
              )}
              {schoolsData &&
                schoolsData.schools.map((school, schoolIdx) => (
                  <View
                    key={schoolIdx}
                    className={cn(school.branches.length > 1 ? 'pb-4' : 'pb-2')}>
                    {/* Canonical Listing. */}
                    <View>
                      {/* {school.branches.length > 1 && (
                        <View className="p-2 pt-0">
                          <Text className="text-lg" style={{ fontFamily: 'Poppins' }}>
                            {school.canonicalName}
                          </Text>
                        </View>
                      )} */}

                      {/* Branch Listing */}
                      <View className="flex-col gap-2">
                        {school.branches.map((branch, branchIdx) => (
                          <View
                            key={branchIdx}
                            className="flex-col gap-2 rounded-md border border-border bg-white p-4">
                            {/* Name & Country */}
                            <View className="flex-row justify-between">
                              <Text
                                className="max-w-[85%] truncate"
                                style={{ fontFamily: 'Poppins' }}>
                                {branch.name}
                              </Text>
                              <View className="h-8 w-8 overflow-hidden rounded-full">
                                <Image
                                  source={{
                                    uri: `https://flagsapi.com/${school.canonicalCountry}/flat/64.png`,
                                  }}
                                  resizeMode={'cover'}
                                  style={{ flex: 1, transform: [{ scale: 1.75 }] }}
                                />
                              </View>
                            </View>

                            {/* Address */}
                            <View className="flex-row items-center justify-between">
                              <Badge variant={'secondary'} className="p-2">
                                <Text style={{ fontFamily: 'Poppins' }}>
                                  {branch.city}, {branch.state}
                                </Text>
                              </Badge>
                              <ChevronRight className="size-4" color={THEME.light.border} />
                            </View>
                          </View>
                        ))}
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
