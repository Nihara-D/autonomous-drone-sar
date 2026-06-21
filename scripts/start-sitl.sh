#!/bin/bash

# Start ArduPilot SITL simulation
# This simulates a quadcopter at the specified home location

echo "Starting ArduPilot SITL (Quadcopter)"
echo "Home location: Colombo, Sri Lanka (6.9271, 79.8612)"
echo ""
echo "This will create a virtual drone that listens on 127.0.0.1:14550"
echo "The backend will connect to this simulator"
echo ""

# Check if sim_vehicle.py is available
if ! command -v sim_vehicle.py &> /dev/null; then
    echo "Error: ArduPilot tools not found"
    echo "Please install with: pip install dronekit-sitl"
    exit 1
fi

# Start SITL
# Parameters:
#   -v ArduCopter  : Vehicle type (quadcopter)
#   --home         : Starting location (lat, lon, alt, heading)
#   --model=quad   : Aircraft model
#   -l             : Location of model files
#   --speedup=1    : Time acceleration (1 = real time)

sim_vehicle.py \
    -v ArduCopter \
    --home=6.9271,79.8612,0,0 \
    --model=quad \
    --speedup=1
