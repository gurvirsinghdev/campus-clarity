import { Text } from '@/components/ui/text';
import { apiBaseUrl } from '@/lib/api';
import { SchoolDetailsValidAPIResponse } from '@/lib/interface';
import { THEME } from '@/lib/theme';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

export default function SchoolScreen() {
  const { schoolId, n } = useLocalSearchParams() as unknown as {
    schoolId: string;
    n: string;
  };
  const schoolName = decodeURI(n);

  const [schoolDetailsData, setSchoolDetailsData] =
    useState<SchoolDetailsValidAPIResponse | null>(null);

  useEffect(function () {
    const fetchSchoolDetails = async () => {
      const apiEndpoint = apiBaseUrl + '/schools/details?sid=' + schoolId;
      const response = await fetch(apiEndpoint);
      const json = (await response.json()) as
        | SchoolDetailsValidAPIResponse
        | undefined;

      if (json && Array.isArray(json.professors)) {
        setSchoolDetailsData(json);
      }
    };
    fetchSchoolDetails();
  }, []);

  const colors = [
    '#FF6B6B',
    '#FF8E3C',
    '#FFC145',
    '#6BCB77',
    '#4D96FF',
    '#845EC2',
    '#FF5E78',
    '#F7B2BD',
    '#F9D8B7',
    '#F7EFAE',
    '#C6E5B1',
    '#B8D8F7',
    '#D3C4F3',
    '#E0E0E0',
    '#C5C6D0',
    '#A8A9B4',
    '#8E8F99',
    '#6C6D75',
  ];

  function getAvatarColor(initials: string) {
    const seed = initials
      .toUpperCase()
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return colors[seed % colors.length];
  }

  function getInitials(
    professor: SchoolDetailsValidAPIResponse['professors'][number]
  ) {
    return professor.firstName[0] + professor.lastName[0];
  }

  function getForegroundColor(bg: string): string {
    // Remove # if present
    const hex = bg.replace('#', '');

    // Parse RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    // Convert to linear RGB
    const toLinear = (c: number) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    const R = toLinear(r);
    const G = toLinear(g);
    const B = toLinear(b);

    // Calculate luminance
    const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;

    // Choose white or black based on luminance threshold
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: schoolName,
          headerTitleStyle: {
            fontFamily: 'Poppins',
          },
          headerBackButtonDisplayMode: 'minimal',
        }}
      />

      <ScrollView className="bg-neutral-100 p-4">
        {schoolDetailsData?.professors.map((professor) => (
          <View
            key={professor.id}
            className="my-2 flex-row gap-4 rounded-md border border-border bg-white p-4">
            {/* Initals Avatar */}
            <View
              className="aspect-square h-12 items-center justify-center rounded-full"
              style={{
                backgroundColor: getAvatarColor(getInitials(professor)),
                // @ts-ignore
                color: getForegroundColor(
                  getAvatarColor(getInitials(professor))
                ),
              }}>
              <Text style={{ fontFamily: 'Poppins' }} className="uppercase">
                {getInitials(professor)}
              </Text>
            </View>

            {/* Name & Department */}
            <View>
              <Text style={{ fontFamily: 'Poppins' }} className="capitalize">
                {professor.firstName}&nbsp;{professor.lastName}
              </Text>
              <Text style={{ fontFamily: 'Poppins' }} className="text-sm">
                {professor.department}
              </Text>
            </View>

            <View className="flex-1 flex-row items-center justify-end">
              <ChevronRight
                style={
                  // @ts-ignore
                  { color: THEME.light.border }
                }
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}
