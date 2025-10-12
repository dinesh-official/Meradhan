import React from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {LucideDownload} from "lucide-react";

const DbTopActionCards = () => {
    return (  <div className={`flex items-center gap-3`} >
            <Select>
                <SelectTrigger className="w-[150px] bg-white">
                    <SelectValue placeholder="Last 30 Days"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="light">Last 7 Days</SelectItem>
                    <SelectItem value="dark">Last Month</SelectItem>
                    <SelectItem value="system">Last 6 Month</SelectItem>
                </SelectContent>
            </Select>
            <Button variant={`default`}>
                <LucideDownload/> Export Data
            </Button>
        </div>
    );
};

export default DbTopActionCards;