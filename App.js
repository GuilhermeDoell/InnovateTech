import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Image, FlatList, Text, TextInput, TouchableOpacity, View, Modal, Pressable, Dimensions } from 'react-native';
import { format } from "date-fns";
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RadioButton } from 'react-native-paper';

export default function App() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailModalVisible, setUserDetailModalVisible] = useState(false);
  const filterButtonRef = useRef(null);
  const [filterButtonCoords, setFilterButtonCoords] = useState({ x: 0, y: 0 });

  async function getUser() {
    try {
      setIsLoading(true);

      const res = await fetch("https://randomuser.me/api/?results=100");
      const data = await res.json();
      setUsers(data.results);
      setFilteredUsers(data.results);

      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    if (text) {
      const filtered = users.filter(user =>
        user.name.first.toLowerCase().includes(text.toLowerCase()) ||
        user.name.last.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  };

  const applyFilter = (type) => {
    let sortedUsers = [...filteredUsers];
    if (type === 'nameAsc') {
      sortedUsers.sort((a, b) => a.name.first.localeCompare(b.name.first));
      setFilteredUsers(sortedUsers);
    } else if (type === 'nameDesc') {
      sortedUsers.sort((a, b) => b.name.first.localeCompare(a.name.first));
      setFilteredUsers(sortedUsers);
    } else if (type === 'dob') {
      setDatePickerVisible(true);
    } else if (type === 'gender') {
      // Gênero será aplicado através de radio buttons
    }
    setModalVisible(false);
  };

  const applyDateFilter = (event, date) => {
    if (date) {
      setSelectedDate(date);
      const filtered = users.filter(user => format(new Date(user.dob.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
      setFilteredUsers(filtered);
    }
    setDatePickerVisible(false);
  };

  const applyGenderFilter = (gender) => {
    setSelectedGender(gender);
    const filtered = users.filter(user => user.gender === gender);
    setFilteredUsers(filtered);
    setModalVisible(false);
  };

  const clearFilters = () => {
    setFilteredUsers(users);
    setSelectedDate(new Date());
    setSelectedGender('');
    setSearch('');
  };

  const openFilterModal = () => {
    filterButtonRef.current.measure((fx, fy, width, height, px, py) => {
      const screenWidth = Dimensions.get('window').width;
      setFilterButtonCoords({ x: screenWidth - 200, y: py + height });
      setModalVisible(true);
    });
  };

  const openUserDetailModal = (user) => {
    setSelectedUser(user);
    setUserDetailModalVisible(true);
  };

  const closeUserDetailModal = () => {
    setSelectedUser(null);
    setUserDetailModalVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />

      <View style={{ padding: 12, marginTop: 40 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
          InnovateTech
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={{ flex: 1, borderWidth: 1, borderColor: '#8d8d8d', padding: 8, borderRadius: 8 }}
            placeholder="Busca..."
            value={search}
            onChangeText={handleSearch}
          />
          <TouchableOpacity
            ref={filterButtonRef}
            style={{ marginLeft: 8, padding: 8, borderRadius: 8 }}
            onPress={openFilterModal}
          >
            <Icon name="filter" size={30} color="#808080" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={user => user.login.uuid}
          renderItem={({ item: user }) => (
            <TouchableOpacity onPress={() => openUserDetailModal(user)}>
              <View style={{ paddingVertical: 16, paddingHorizontal: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#8d8d8d', padding: 8 }}>
                  <Image 
                    source={{ uri: user.picture.large }}
                    style={{ width: 80, height: 80, borderRadius: 40 }}
                  />
                  <View>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                      {user.name.title} {user.name.first} {user.name.last}
                    </Text>
                    <Text style={{ fontSize: 16 }}>
                      {user.gender} {"      "}
                      {format(new Date(user.dob.date), "dd/MM/yyyy")}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setModalVisible(false)}>
          <View style={{ position: 'absolute', top: filterButtonCoords.y, left: filterButtonCoords.x, width: 200, backgroundColor: 'white', padding: 10, borderRadius: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Filter Options</Text>
            <Pressable onPress={() => applyFilter('nameAsc')}>
              <Text style={{ fontSize: 16, marginBottom: 8 }}>Name (A-Z)</Text>
            </Pressable>
            <Pressable onPress={() => applyFilter('nameDesc')}>
              <Text style={{ fontSize: 16, marginBottom: 8 }}>Name (Z-A)</Text>
            </Pressable>
            <Pressable onPress={() => applyFilter('dob')}>
              <Text style={{ fontSize: 16, marginBottom: 8 }}>Date of Birth</Text>
            </Pressable>
            <Text style={{ fontSize: 16, marginTop: 8 }}>Gender</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <RadioButton
                value="male"
                status={selectedGender === 'male' ? 'checked' : 'unchecked'}
                onPress={() => applyGenderFilter('male')}
              />
              <Text style={{ fontSize: 16 }}>Male</Text>
              <RadioButton
                value="female"
                status={selectedGender === 'female' ? 'checked' : 'unchecked'}
                onPress={() => applyGenderFilter('female')}
              />
              <Text style={{ fontSize: 16 }}>Female</Text>
            </View>
            <Pressable onPress={clearFilters}>
              <Text style={{ fontSize: 16, color: '#1E90FF', marginTop: 16 }}>Clear</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={datePickerVisible}
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Select Date of Birth</Text>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={applyDateFilter}
            />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={userDetailModalVisible}
        onRequestClose={closeUserDetailModal}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 45, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}>
            {selectedUser && (
              <>
                <Image 
                    source={{ uri: selectedUser.picture.large }}
                    style={{ width: 160, height: 160, borderRadius: 90 }}
                />
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                  {selectedUser.name.title} {selectedUser.name.first} {selectedUser.name.last}
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 4 }}>
                  E-mail: {selectedUser.email}
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 4 }}>
                  Gender: {selectedUser.gender}
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 4 }}>
                  Date of Birth: {format(new Date(selectedUser.dob.date), "dd/MM/yyyy")}
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 4 }}>
                  phone: {selectedUser.phone}
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 4 }}>
                  Nationality: {selectedUser.nat}
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 4 }}>
                  Address: {selectedUser.location.street.number} {selectedUser.location.street.name}, {selectedUser.location.city}, {selectedUser.location.state}, {selectedUser.location.postcode}, {selectedUser.location.country} 
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 4 }}>
                  ID: {selectedUser.id.name} {selectedUser.id.value}
                </Text>
                <Pressable onPress={closeUserDetailModal}>
                  <Text style={{ fontSize: 16, color: '#FF0000', marginTop: 16 }}>Close</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}