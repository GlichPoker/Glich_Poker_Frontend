"use client";
import React, { useState } from "react";
import { Badge, Popover, List, Avatar, Button, App, Spin, Divider, Empty } from "antd";
import { NotificationOutlined, TeamOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useLobbyInvitations, LobbyInvitation } from "@/hooks/useLobbyInvitations";
import "@ant-design/v5-patch-for-react-19";

const LobbyInvitationNotification: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { message } = App.useApp();
  
  const { 
    invitations = [], 
    loading = false, 
    acceptInvitation = async () => ({ success: false, message: 'Failed to initialize' }),
    declineInvitation = async () => ({ success: false, message: 'Failed to initialize' }),
    refreshInvitationsData = () => {},
    error = null
  } = useLobbyInvitations() || {};

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    
    // Only refresh invitation data when opening the popover, not when closing it
    if (newOpen && !open) {
      // Using setTimeout to prevent potential race conditions
      setTimeout(() => {
        refreshInvitationsData();
      }, 0);
    }
  };

  const handleAccept = async (invitation: LobbyInvitation) => {
    if (!invitation.sessionId) {
      message.error("Cannot accept invitation: Session ID is missing");
      return;
    }
    
    const result = await acceptInvitation(invitation.sessionId);
    if (result.success) {
      message.success(result.message);
      refreshInvitationsData(); // Refresh to update UI
    } else {
      message.error(result.message);
    }
  };

  const handleDecline = async (invitation: LobbyInvitation) => {
    if (!invitation.sessionId) {
      message.error("Cannot decline invitation: Session ID is missing");
      return;
    }
    
    const result = await declineInvitation(invitation.sessionId);
    if (result.success) {
      message.success(result.message);
      refreshInvitationsData(); // Refresh to update UI
    } else {
      message.error(result.message);
    }
  };

  // Render each lobby invitation item
  const renderInvitationItem = (invitation: LobbyInvitation) => (
    <List.Item
      key={invitation.sessionId || "unknown"}
      className="flex justify-between items-center"
      actions={[
        <Button 
          key="accept" 
          type="text" 
          size="small" 
          icon={<CheckOutlined style={{ color: 'green' }} />} 
          onClick={() => handleAccept(invitation)}
          title="Accept"
        />,
        <Button 
          key="decline" 
          type="text" 
          size="small" 
          icon={<CloseOutlined style={{ color: 'red' }} />} 
          onClick={() => handleDecline(invitation)}
          title="Decline"
        />
      ]}
    >
      <List.Item.Meta
        avatar={<Avatar icon={<TeamOutlined style={{ color: 'white' }} />} />}
        title={invitation.inviterName || `Game Session ${invitation.sessionId}`}
        description={`Invitation to game session ${invitation.sessionId}`}
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
      ) : invitations.length > 0 ? (
        <>
          <div className="px-1 py-2">
            <div className="font-medium mb-2">Game Invitations</div>
            <Divider className="my-2" />
            <List
              dataSource={invitations}
              renderItem={renderInvitationItem}
              className="game-invitations-list"
            />
          </div>
        </>
      ) : (
        <Empty
          description={<span style={{ color: 'white' }}>No pending game invitations</span>}
          className="py-4"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );

  // Handle errors gracefully - if there's an error, just show the icon without a badge
  if (error) {
    console.warn('LobbyInvitationNotification error:', error);
    return (
      <NotificationOutlined 
        className="!text-gray-400 !text-[24px] cursor-pointer" 
        onClick={() => message.info('Invitation service currently unavailable')} 
      />
    );
  }

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
      <Badge count={invitations?.length || 0} overflowCount={9} size="small">
        <NotificationOutlined
          className="!text-gray-400 !text-[24px] cursor-pointer"
          onClick={() => setOpen(true)}
        />
      </Badge>
    </Popover>
  );
};

export default LobbyInvitationNotification;
