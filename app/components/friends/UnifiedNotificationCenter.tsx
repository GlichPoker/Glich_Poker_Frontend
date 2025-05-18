"use client";
import React, { useState } from "react";
import { Badge, Popover, List, Avatar, Button, App, Spin, Divider, Empty, Tabs } from "antd";
import { BellOutlined, UserOutlined, TeamOutlined, CheckOutlined, CloseOutlined, NotificationOutlined } from "@ant-design/icons";
import { useFriends, FriendWithStatus } from "@/hooks/useFriends";
import { useLobbyInvitations, LobbyInvitation } from "@/hooks/useLobbyInvitations";
import "@ant-design/v5-patch-for-react-19";

const UnifiedNotificationCenter: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { message } = App.useApp();

  const {
    pendingRequests = [],
    loading: friendsLoading,
    acceptFriendRequest,
    denyFriendRequest,
    refreshFriendsData,
  } = useFriends() || {};

  const {
    invitations = [],
    loading: invitationsLoading,
    acceptInvitation,
    declineInvitation,
    refreshInvitationsData,
    error: invitationsError,
  } = useLobbyInvitations() || {};

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      refreshFriendsData?.();
      // Adding a small delay to avoid potential race conditions with the popover opening animation
      setTimeout(() => {
        refreshInvitationsData?.();
      }, 100);
    }
  };

  const handleAcceptFriend = async (friend: FriendWithStatus) => {
    if (!friend.username) {
      message.error("Cannot accept request: Username is missing");
      return;
    }
    const result = await acceptFriendRequest?.(friend.username);
    if (result?.success) {
      message.success(result.message);
      refreshFriendsData?.();
    } else {
      message.error(result?.message || "Failed to accept friend request");
    }
  };

  const handleDenyFriend = async (friend: FriendWithStatus) => {
    if (!friend.username) {
      message.error("Cannot deny request: Username is missing");
      return;
    }
    const result = await denyFriendRequest?.(friend.username);
    if (result?.success) {
      message.success(result.message);
      refreshFriendsData?.();
    } else {
      message.error(result?.message || "Failed to deny friend request");
    }
  };

  const handleAcceptInvitation = async (invitation: LobbyInvitation) => {
    if (!invitation.sessionId) {
      message.error("Cannot accept invitation: Session ID is missing");
      return;
    }
    const result = await acceptInvitation?.(invitation.sessionId);
    if (result?.success) {
      message.success(result.message);
      refreshInvitationsData?.();
    } else {
      message.error(result?.message || "Failed to accept invitation");
    }
  };

  const handleDeclineInvitation = async (invitation: LobbyInvitation) => {
    if (!invitation.sessionId) {
      message.error("Cannot decline invitation: Session ID is missing");
      return;
    }
    const result = await declineInvitation?.(invitation.sessionId);
    if (result?.success) {
      message.success(result.message);
      refreshInvitationsData?.();
    } else {
      message.error(result?.message || "Failed to decline invitation");
    }
  };

  const renderFriendRequestItem = (friend: FriendWithStatus) => (
    <List.Item
      key={friend.username || "unknown-friend"}
      actions={[
        <Button key="accept" type="text" size="small" icon={<CheckOutlined style={{ color: 'green' }} />} onClick={() => handleAcceptFriend(friend)} title="Accept" />,
        <Button key="deny" type="text" size="small" icon={<CloseOutlined style={{ color: 'red' }} />} onClick={() => handleDenyFriend(friend)} title="Deny" />,
      ]}
    >
      <List.Item.Meta
        avatar={<Avatar icon={<UserOutlined style={{ color: 'white' }} />} />}
        title={friend.username || "Unknown User"}
      />
    </List.Item>
  );

  const renderInvitationItem = (invitation: LobbyInvitation) => (
    <List.Item
      key={invitation.sessionId || "unknown-invitation"}
      actions={[
        <Button key="accept" type="text" size="small" icon={<CheckOutlined style={{ color: 'green' }} />} onClick={() => handleAcceptInvitation(invitation)} title="Accept" />,
        <Button key="decline" type="text" size="small" icon={<CloseOutlined style={{ color: 'red' }} />} onClick={() => handleDeclineInvitation(invitation)} title="Decline" />,
      ]}
    >
      <List.Item.Meta
        avatar={<Avatar icon={<TeamOutlined style={{ color: 'white' }} />} />}
        title={invitation.inviterName || `Game Session ${invitation.sessionId}`}
        description={`Invitation to game session ${invitation.sessionId}`}
      />
    </List.Item>
  );

  const friendRequestsContent = (
    <>
      {friendsLoading ? (
        <div className="flex justify-center py-4"><Spin /></div>
      ) : pendingRequests.length > 0 ? (
        <List
          dataSource={pendingRequests}
          renderItem={renderFriendRequestItem}
          className="friend-requests-list"
        />
      ) : (
        <Empty description={<span style={{ color: 'white' }}>No pending friend requests</span>} className="py-4" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </>
  );

  const gameInvitationsContent = (
    <>
      {invitationsLoading ? (
        <div className="flex justify-center py-4"><Spin /></div>
      ) : invitationsError ? (
         <Empty description={<span style={{ color: 'white' }}>Invitation service unavailable</span>} className="py-4" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : invitations.length > 0 ? (
        <List
          dataSource={invitations}
          renderItem={renderInvitationItem}
          className="game-invitations-list"
        />
      ) : (
        <Empty description={<span style={{ color: 'white' }}>No pending game invitations</span>} className="py-4" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </>
  );

  const tabItems = [
    {
      label: (
        <Badge count={pendingRequests?.length || 0} offset={[10, -5]} size="small">
          Friend Requests
        </Badge>
      ),
      key: '1',
      children: friendRequestsContent,
    },
    {
      label: (
        <Badge count={invitationsError ? "!" : (invitations?.length || 0)} offset={[10, -5]} size="small" status={invitationsError ? "error" : "default"}>
          Game Invitations
        </Badge>
      ),
      key: '2',
      children: gameInvitationsContent,
    },
  ];

  const popoverContent = (
    <div style={{ width: 320, maxHeight: 400, overflowY: 'auto' }}>
      {/* Use items prop instead of TabPane */}
      <Tabs defaultActiveKey="1" centered items={tabItems} />
    </div>
  );
  
  const totalNotifications = (pendingRequests?.length || 0) + (invitationsError ? 0 : (invitations?.length || 0));

  return (
    <Popover
      content={popoverContent}
      title={null}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      arrow={false}
    >
      <Badge count={totalNotifications} overflowCount={99} size="small">
        <BellOutlined // Using BellOutlined as the general notification icon
          className="!text-gray-400 !text-[24px] cursor-pointer"
          onClick={() => setOpen(!open)} // Toggle open state
        />
      </Badge>
    </Popover>
  );
};

export default UnifiedNotificationCenter;
