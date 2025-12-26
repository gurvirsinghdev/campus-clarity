"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface SearchSchoolAPIResponse {
  schools: {
    canonicalName: string;
    canonicalCountry: string;
    brances: {
      id: string;
      city: string;
      state: string;
      cursor: string;
    }[];
  }[];
}

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string | null>();
  const [schoolsData, setSchoolsData] =
    useState<SearchSchoolAPIResponse | null>(null);
  const [controller, setController] = useState<AbortController | null>(null);

  const fetchSchools = async function (signal: AbortSignal) {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/schools/search?q=" + searchQuery,
        { signal }
      );
      const json = await response.json();

      if (json) setSchoolsData(json as SearchSchoolAPIResponse);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(
    function () {
      if (!searchQuery) return;
      if (controller) {
        controller.abort();
        setController(null);
      }

      const newController = new AbortController();
      setController(newController);
      fetchSchools(newController.signal);
    },
    [searchQuery]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-medium">
            Search for a School
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-2 relative">
            <Label htmlFor="school">School</Label>
            <Input
              id="school"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Start typing a school name..."
            />

            {schoolsData && schoolsData.schools.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md max-h-64 overflow-auto">
                {schoolsData.schools.map((school, idx) => (
                  <button
                    key={school.canonicalName + idx}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="font-medium flex items-center justify-between">
                      <span>{school.canonicalName}</span>
                      <span>{school.canonicalCountry}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading && (
            <div className="text-xs text-muted-foreground mt-1">
              Searching...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
