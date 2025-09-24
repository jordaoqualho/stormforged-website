#!/bin/bash

# Stormforged Guild Tracker - Release Scripts
# Created by Jordones

# Function to build the project and push changes to the remote repository
function SimplePush {
    echo "Building project..."
    npm run --silent build
    if [ $? -eq 0 ]; then
        # If the build is successful
        echo "Build successful."
        npm run release
        echo "Changes pushed successfully."
        echo "All tasks completed."
    else
        # If the build fails
        echo "Build failed. Unable to push changes."
    fi
}

# Function to build the project, create a patch release, and push changes
function PushPatch {
    echo "Building project..."
    npm run --silent build
    if [ $? -eq 0 ]; then
        # If the build is successful
        echo "Build successful."
        echo "Creating patch release..."
        npm run release -- --release-as patch
        echo "Patch release created successfully."
        echo "Pushing changes to origin..."
        git push
        echo "Changes pushed successfully."
        echo "All tasks completed."
    else
        # If the build fails
        echo "Build failed. Unable to create patch release."
    fi
}

# Function to build the project, create a minor release, and push changes
function PushMinor {
    echo "Building project..."
    npm run --silent build
    if [ $? -eq 0 ]; then
        # If the build is successful
        echo "Build successful."
        echo "Creating minor release..."
        npm run release -- --release-as minor
        echo "Minor release created successfully."
        echo "Pushing changes to origin..."
        git push
        echo "Changes pushed successfully."
        echo "All tasks completed."
    else
        # If the build fails
        echo "Build failed. Unable to create minor release."
    fi
}

# Function to build the project, create a major release, and push changes
function PushMajor {
    echo "Building project..."
    npm run --silent build
    if [ $? -eq 0 ]; then
        # If the build is successful
        echo "Build successful."
        echo "Creating major release..."
        npm run release -- --release-as major
        echo "Major release created successfully."
        echo "Pushing changes to origin..."
        git push
        echo "Changes pushed successfully."
        echo "All tasks completed."
    else
        # If the build fails
        echo "Build failed. Unable to create major release."
    fi
}

# Display usage information
echo "Stormforged Guild Tracker - Release Functions"
echo "=============================================="
echo ""
echo "Available functions:"
echo "  SimplePush  - Build and create release (auto-detect version bump)"
echo "  PushPatch   - Build and create patch release (0.1.0 -> 0.1.1)"
echo "  PushMinor   - Build and create minor release (0.1.0 -> 0.2.0)"
echo "  PushMajor   - Build and create major release (0.1.0 -> 1.0.0)"
echo ""
echo "Usage:"
echo "  source release.sh"
echo "  PushPatch"
echo ""
echo "Or run directly:"
echo "  bash release.sh PushPatch"
