'use client';

import React, { useEffect, useState } from 'react';
import { useSocket } from '@/lib/socket-context';
import { cn } from '@/lib/utils';
import { toast } from './ui/toaster';

interface Seat {
  number: string;
  row: number;
  column: string;
  status: 'available' | 'occupied' | 'selected' | 'blocked';
  type?: 'standard' | 'extra-legroom' | 'premium' | 'emergency-exit';
  passenger?: {
    id: string;
    name: string;
  };
}

interface SeatMapProps {
  flightId: string;
  onSeatSelect?: (seat: Seat) => void;
  selectedSeats?: string[];
  className?: string;
}

// Sample aircraft configuration (Airbus A320-like)
const generateSeatMap = (): Seat[][] => {
  const rows = 30;
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatMap: Seat[][] = [];

  for (let row = 1; row <= rows; row++) {
    const rowSeats: Seat[] = [];
    for (const column of columns) {
      const seatNumber = `${row}${column}`;
      rowSeats.push({
        number: seatNumber,
        row,
        column,
        status: 'available',
        type: row <= 3 ? 'premium' : row === 12 || row === 13 ? 'emergency-exit' : 'standard',
      });
    }
    seatMap.push(rowSeats);
  }

  return seatMap;
};

export function SeatMap({ flightId, onSeatSelect, selectedSeats = [], className }: SeatMapProps) {
  const { socket, isConnected, joinFlight, leaveFlight } = useSocket();
  const [seats, setSeats] = useState<Seat[][]>(generateSeatMap());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && flightId) {
      // Join the flight room for real-time updates
      joinFlight(flightId);

      // Listen for seat updates
      if (socket) {
        socket.on('seat:map:update', (seatMap: any) => {
          console.log('Seat map updated:', seatMap);
          // Update seat map with new data
          // In production, you'd merge this with existing seat map
        });

        socket.on('seat:blocked', ({ seatNumber, agentId }: any) => {
          console.log(`Seat ${seatNumber} blocked by ${agentId}`);
          updateSeatStatus(seatNumber, 'blocked');
          toast(`Seat ${seatNumber} blocked by another agent`, 'info');
        });

        socket.on('seat:released', ({ seatNumber }: any) => {
          console.log(`Seat ${seatNumber} released`);
          updateSeatStatus(seatNumber, 'available');
        });

        socket.on('seat:assigned', ({ seatNumber, passengerName }: any) => {
          console.log(`Seat ${seatNumber} assigned to ${passengerName}`);
          updateSeatStatus(seatNumber, 'occupied', { name: passengerName });
        });
      }

      return () => {
        leaveFlight(flightId);
        if (socket) {
          socket.off('seat:map:update');
          socket.off('seat:blocked');
          socket.off('seat:released');
          socket.off('seat:assigned');
        }
      };
    }
  }, [isConnected, flightId, socket]);

  const updateSeatStatus = (
    seatNumber: string,
    status: Seat['status'],
    passenger?: { name: string }
  ) => {
    setSeats((prev) =>
      prev.map((row) =>
        row.map((seat) =>
          seat.number === seatNumber
            ? { ...seat, status, passenger: passenger ? { id: '', name: passenger.name } : undefined }
            : seat
        )
      )
    );
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied' || seat.status === 'blocked') {
      toast(`Seat ${seat.number} is not available`, 'error');
      return;
    }

    // Toggle selection
    const isSelected = selectedSeats.includes(seat.number);
    const newStatus = isSelected ? 'available' : 'selected';

    updateSeatStatus(seat.number, newStatus);

    if (onSeatSelect) {
      onSeatSelect({ ...seat, status: newStatus });
    }
  };

  const getSeatClassName = (seat: Seat) => {
    const isSelected = selectedSeats.includes(seat.number);
    return cn('seat', {
      available: seat.status === 'available' && !isSelected,
      occupied: seat.status === 'occupied',
      selected: isSelected || seat.status === 'selected',
      blocked: seat.status === 'blocked',
    });
  };

  return (
    <div className={cn('bg-white rounded-lg p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Seat Map</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-50"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-gray-400 bg-gray-200"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-100"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-yellow-500 bg-yellow-50"></div>
            <span>Blocked</span>
          </div>
        </div>
      </div>

      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm text-yellow-800">
          Connecting to real-time updates...
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Aircraft nose */}
          <div className="flex justify-center mb-4">
            <div className="w-48 h-12 bg-gray-200 rounded-t-full flex items-center justify-center text-sm text-gray-600 font-semibold">
              Front
            </div>
          </div>

          {/* Column labels */}
          <div className="flex justify-center mb-2">
            <div className="flex gap-2">
              {['A', 'B', 'C'].map((col) => (
                <div key={col} className="w-8 text-center text-sm font-semibold text-gray-600">
                  {col}
                </div>
              ))}
              <div className="w-8"></div>
              {['D', 'E', 'F'].map((col) => (
                <div key={col} className="w-8 text-center text-sm font-semibold text-gray-600">
                  {col}
                </div>
              ))}
            </div>
          </div>

          {/* Seat rows */}
          <div className="space-y-2">
            {seats.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center justify-center gap-2">
                {/* Row number (left) */}
                <div className="w-6 text-right text-sm font-semibold text-gray-600">
                  {row[0].row}
                </div>

                {/* Left side seats (ABC) */}
                <div className="flex gap-2">
                  {row.slice(0, 3).map((seat) => (
                    <button
                      key={seat.number}
                      onClick={() => handleSeatClick(seat)}
                      className={getSeatClassName(seat)}
                      title={`${seat.number} - ${seat.status}${seat.passenger ? ` (${seat.passenger.name})` : ''}`}
                      disabled={seat.status === 'occupied' || seat.status === 'blocked'}
                    >
                      {seat.type === 'premium' && '★'}
                      {seat.type === 'emergency-exit' && '⊕'}
                    </button>
                  ))}
                </div>

                {/* Aisle */}
                <div className="w-8"></div>

                {/* Right side seats (DEF) */}
                <div className="flex gap-2">
                  {row.slice(3, 6).map((seat) => (
                    <button
                      key={seat.number}
                      onClick={() => handleSeatClick(seat)}
                      className={getSeatClassName(seat)}
                      title={`${seat.number} - ${seat.status}${seat.passenger ? ` (${seat.passenger.name})` : ''}`}
                      disabled={seat.status === 'occupied' || seat.status === 'blocked'}
                    >
                      {seat.type === 'premium' && '★'}
                      {seat.type === 'emergency-exit' && '⊕'}
                    </button>
                  ))}
                </div>

                {/* Row number (right) */}
                <div className="w-6 text-left text-sm font-semibold text-gray-600">
                  {row[0].row}
                </div>
              </div>
            ))}
          </div>

          {/* Aircraft tail */}
          <div className="flex justify-center mt-4">
            <div className="w-48 h-8 bg-gray-200 rounded-b-full flex items-center justify-center text-sm text-gray-600 font-semibold">
              Rear
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>★ Premium seats | ⊕ Emergency exit rows</p>
        {selectedSeats.length > 0 && (
          <p className="mt-2 font-semibold text-blue-600">
            Selected seats: {selectedSeats.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
