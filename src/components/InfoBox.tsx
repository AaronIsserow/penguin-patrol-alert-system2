import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePerimeterStatus } from "@/hooks/usePerimeterStatus";
import { Skeleton } from "@/components/ui/skeleton";

const InfoBox: React.FC = () => {
  const { perimeters, loading, error } = usePerimeterStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Honey Badger Detection System</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            This system acts as a sensing and tracking system to protect a colony of penguins 
            at Stoney Point using a deterrent system.
          </p>
          
          <div>
            <h3 className="font-semibold mb-2">Perimeter Status:</h3>
            <div className="grid grid-cols-2 gap-2">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                ))
              ) : error ? (
                <div className="col-span-2 text-sm text-destructive">
                  Failed to load perimeter statuses
                </div>
              ) : (
                perimeters.map((perimeter) => (
                  <div key={perimeter.zone} className="flex items-center gap-2 p-2 border rounded-md">
                    <div className={`w-3 h-3 rounded-full ${perimeter.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Perimeter {perimeter.zone}</span>
                    <span className={`text-xs ml-auto ${perimeter.status ? 'text-green-600' : 'text-red-600'}`}>
                      {perimeter.status ? 'Online' : 'Offline'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfoBox;
