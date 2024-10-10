import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

const emojiList = ['😀', '😂', '❤️', '😢', '👍'];

const PostScreen = () => {
  const [posts, setPosts] = useState([]);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const navigation = useNavigation();

  // Fetch posts on screen focus
  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, [skip]),
  );

  // Fetch posts from the server
  const fetchPosts = async () => {
    if (loading || allPostsLoaded) return;

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(
        `http://192.168.0.9:7000/api/v1/app/posts/fetchallpost/${skip}/${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'CuQvyhZDEhmvKdvdZmIrKgNbsmFjHQxhRKjWCvvQ',
            'x-app-version': '1.0.1',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();

      if (result.success) {
        if (result.data.length < limit) {
          setAllPostsLoaded(true);
        }
        setPosts(prevPosts => [...prevPosts, ...result.data]);
        setSkip(prevSkip => prevSkip + limit);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle refreshing of posts
  const onRefresh = async () => {
    setRefreshing(true);
    setSkip(0);
    setPosts([]);
    await fetchPosts();
    setRefreshing(false);
  };

  // Toggle like status with emoji
  const toggleLikeWithEmoji = (postId, emoji) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId ? {...post, liked: !post.liked, emoji} : post,
      ),
    );
    setEmojiPickerVisible(false);
    setCurrentPostId(null);
  };

  // Render a single post item
  const renderPost = ({item}) => (
    <View style={styles.postContainer}>
      <Text style={styles.userName}>{item.user.fullName}</Text>
      <Text style={styles.caption}>{item.caption}</Text>
      {item.imageUrl && (
        <TouchableOpacity
          onPress={() => {
            setSelectedImage(
              `https://chatapp1305.s3.eu-north-1.amazonaws.com/${item.imageUrl}`,
            );
            setModalVisible(true);
          }}>
          <Image
            source={{
              uri: `https://chatapp1305.s3.eu-north-1.amazonaws.com/${item.imageUrl}`,
            }}
            style={styles.postImage}
          />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPressIn={() => {
          setCurrentPostId(item._id);
          setEmojiPickerVisible(true);
        }}>
        <Text style={styles.likeText}>
          {item.liked ? item.emoji || '❤️' : '👍'}
        </Text>
      </TouchableOpacity>

      {emojiPickerVisible && currentPostId === item._id && (
        <View style={styles.emojiPicker}>
          {emojiList.map(emoji => (
            <TouchableOpacity
              key={emoji}
              onPress={() => toggleLikeWithEmoji(item._id, emoji)}
              style={styles.emojiButton}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // Render the footer of the list
  const renderFooter = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#ff69b4" />;
    }
    if (allPostsLoaded) {
      return <Text style={styles.noMorePostsText}>No more posts</Text>;
    }
    return null;
  };

  // Render header for the FlatList
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>1305 Gallery</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item, index) => item._id + '_' + index}
        onEndReached={fetchPosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderHeader} // Add header component here
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Newpost')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Pressable
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </Pressable>
          {selectedImage && (
            <Image source={{uri: selectedImage}} style={styles.largeImage} />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#ffe4e1',
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#ff69b4',
    alignItems: 'center',
    borderRadius: 10,
  },
  headerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  postContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  caption: {
    marginBottom: 5,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginTop: 5,
  },
  noMorePostsText: {
    textAlign: 'center',
    padding: 10,
    color: 'gray',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#ff69b4',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
  },
  likeText: {
    color: '#ff69b4',
    marginTop: 5,
    fontSize: 32,
  },
  emojiPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 5,
    width: 100,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  emojiButton: {
    padding: 10,
  },
  emojiText: {
    fontSize: 32,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  largeImage: {
    width: '90%',
    height: '90%',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 30,
    backgroundColor: '#ff69b4',
    borderRadius: 20,
    padding: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default PostScreen;
