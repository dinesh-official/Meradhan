import React from 'react';
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import DbTopActionCards from "@/app/(presentation)/dashboard/_componets/DBTopActionCards";

const DashBoardView = () => {
    return (
        <div>
            <PageInfoBar
                title="Dashboard Overview"
                description="Welcome back! Here's what's happening with your bond platform today."
                actions={<DbTopActionCards/>}
            />
        </div>
    );
};

export default DashBoardView;