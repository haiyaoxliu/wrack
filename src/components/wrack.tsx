"use client";
import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Camera, Plus, BarChart2 } from "lucide-react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { invoke } from "@tauri-apps/api/tauri";

interface ClothingItem {
    name: string;
    cost: number;
    uses: string[];
}

const Wrack: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"add" | "stats">("add");
    const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
    const [newItemName, setNewItemName] = useState<string>("");
    const [newItemCost, setNewItemCost] = useState<string>("");

    useEffect(() => {
        loadClothingItems();
    }, []);

    const loadClothingItems = async (): Promise<void> => {
        try {
            const items = await invoke<ClothingItem[]>("get_clothing_items");
            setClothingItems(items);
        } catch (error) {
            console.error("Failed to load clothing items:", error);
        }
    };

    const handleAddItem = async (): Promise<void> => {
        if (newItemName.trim() === "" || newItemCost.trim() === "") return;

        try {
            await invoke("add_clothing_item", {
                name: newItemName,
                cost: parseFloat(newItemCost),
            });
            setNewItemName("");
            setNewItemCost("");
            loadClothingItems();
        } catch (error) {
            console.error("Failed to add clothing item:", error);
        }
    };

    const handleAddUse = async (name: string): Promise<void> => {
        try {
            await invoke("add_use", {
                name,
                date: new Date().toISOString().split("T")[0],
            });
            loadClothingItems();
        } catch (error) {
            console.error("Failed to add use:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
                    Clothes Tracker
                </h1>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex mb-6">
                        <Button
                            onClick={() => setActiveTab("add")}
                            variant={
                                activeTab === "add" ? "default" : "outline"
                            }
                            className="mr-2"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                        <Button
                            onClick={() => setActiveTab("stats")}
                            variant={
                                activeTab === "stats" ? "default" : "outline"
                            }
                        >
                            <BarChart2 className="mr-2 h-4 w-4" /> View Stats
                        </Button>
                    </div>

                    {activeTab === "add" && (
                        <div>
                            <div className="mb-4">
                                <Label htmlFor="item-name">Name</Label>
                                <Input
                                    id="item-name"
                                    placeholder="Enter item name"
                                    value={newItemName}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) => setNewItemName(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="item-cost">Cost</Label>
                                <Input
                                    id="item-cost"
                                    placeholder="Enter item cost"
                                    type="number"
                                    value={newItemCost}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) => setNewItemCost(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="item-image">
                                    Image (optional)
                                </Label>
                                <div className="mt-1 flex items-center">
                                    <Button variant="outline">
                                        <Camera className="mr-2 h-4 w-4" />{" "}
                                        Upload Image
                                    </Button>
                                </div>
                            </div>
                            <Button onClick={handleAddItem}>Add Item</Button>
                        </div>
                    )}

                    {activeTab === "stats" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">
                                Wear Statistics
                            </h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={clothingItems}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar
                                        dataKey="uses.length"
                                        fill="#8884d8"
                                        name="Wears"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {clothingItems.map((item, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle>{item.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-md text-gray-500">
                                    Total Wears: {item.uses.length}
                                </p>
                                <p className="text-md text-gray-500">
                                    Cost: ${item.cost.toFixed(2)}
                                </p>
                                <p className="text-md text-gray-500">
                                    Cost per use: $
                                    {(
                                        item.cost / (item.uses.length || 1)
                                    ).toFixed(2)}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    onClick={() => handleAddUse(item.name)}
                                    className="mt-2 w-full"
                                >
                                    Add Use
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Wrack;
