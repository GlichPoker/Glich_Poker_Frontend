"use client";
import React, { useState } from "react";
import { Badge, Popover, List, Avatar, Button, App, Spin, Divider, Empty } from "antd";
import { BellOutlined, UserOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useFriends, FriendWithStatus } from "@/hooks/useFriends";
import "@ant-design/v5-patch-for-react-19";

const FriendRequestsNotification: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { message } = App.useApp();
  
  const { 
    pendingRequests, 
    loading, 
    acceptFriendRequest, 
    denyFriendRequest,
    refreshFriendsData
  } = useFriends();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    
    // Refresh friend request data when opening the popover
    if (newOpen) {
      refreshFriendsData();
    }
  };

  const handleAccept = async (friend: FriendWithStatus) => {
    if (!friend.username) {
      message.error("Cannot accept request: Username is missing");
      return;
    }
    
    const result = await acceptFriendRequest(friend.username);
    if (result.success) {
      message.success(result.message);
      refreshFriendsData(); // Refresh to update UI
    } else {
      message.error(result.message);
    }
  };

  const handleDeny = async (friend: FriendWithStatus) => {
    if (!friend.username) {
      message.error("Cannot deny request: Username is missing");
      return;
    }
    
    const result = await denyFriendRequest(friend.username);
    if (result.success) {
      message.success(result.message);
      refreshFriendsData(); // Refresh to update UI
    } else {
      message.error(result.message);
    }
  };

  // Render each friend request item
  const renderRequestItem = (friend: FriendWithStatus) => (
    <List.Item
      key={friend.username || "unknown"} // Use username as key since ID might be missing
      className="flex justify-between items-center"
      actions={[
        <Button 
          key="accept" 
          type="text" 
          size="small" 
          icon={<CheckOutlined style={{ color: 'green' }} />} 
          onClick={() => handleAccept(friend)}
          title="Accept"
        />,
        <Button 
          key="deny" 
          type="text" 
          size="small" 
          icon={<CloseOutlined style={{ color: 'red' }} />} 
          onClick={() => handleDeny(friend)}
          title="Deny"
        />
      ]}
    >
      <List.Item.Meta
        avatar={<Avatar icon={<UserOutlined />} />}
        title={friend.username || "Unknown User"}
      />
    </List.Item>
  );

  // Content for the popover
  const content = (
    <div style={{ maxWidth: 300, maxHeight: 400, overflowY: 'auto' }}>
      {loading ? (
        <div className="flex justify-center py-4">
          <Spin />
        </div>
      ) : pendingRequests.length > 0 ? (
        <>
          <div className="px-1 py-2">
            <div className="font-medium mb-2">Friend Requests</div>
            <Divider className="my-2" />
            <List
              dataSource={pendingRequests}
              renderItem={renderRequestItem}
              className="friend-requests-list"
            />
          </div>
        </>
      ) : (
        <Empty
          description="No pending friend requests"
          className="py-4"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      title={null}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      arrow={false}
    >
      <Badge count={pendingRequests.length} overflowCount={9} size="small">
        <BellOutlined
          className="!text-gray-400 !text-[24px] cursor-pointer"
          onClick={() => setOpen(true)}
        />
      </Badge>
    </Popover>
  );
};

export default FriendRequestsNotification;
