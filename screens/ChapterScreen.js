import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { ArrowRight } from 'lucide-react-native';

const ChapterScreen = ({ route, navigation }) => {
  const { unitId, chapterId, title, content } = route.params;
  const [currentPage, setCurrentPage] = useState(0);
  
  // Extract pages from content
  const pages = content?.pages || [];
  const totalPages = pages.length;
  
  // Navigate to the next page
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // If we're on the last page, navigate to the test
      navigation.navigate('Test', {
        unitId,
        chapterId,
        title: `${title} Test`,
      });
    }
  };
  
  // Navigate to the previous page
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Get current page content
  const currentPageContent = pages[currentPage] || {};
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.pageContainer}>
          {/* Page title */}
          <Text style={styles.pageTitle}>{currentPageContent.title}</Text>
          
          {/* Page image */}
          {currentPageContent.imageUrl && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: currentPageContent.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          )}
          
          {/* Page content sections */}
          {currentPageContent.sections?.map((section, index) => (
            <View key={index} style={styles.section}>
              {section.subtitle && (
                <Text style={styles.sectionTitle}>{section.subtitle}</Text>
              )}
              <Text style={styles.sectionContent}>{section.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      
      {/* Navigation controls */}
      <View style={styles.navigationContainer}>
        <View style={styles.paginationContainer}>
          {Array.from({ length: totalPages }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                { backgroundColor: currentPage === index ? '#4CAF50' : '#E0E0E0' }
              ]}
            />
          ))}
        </View>
        
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton, { opacity: currentPage === 0 ? 0.5 : 1 }]}
            onPress={prevPage}
            disabled={currentPage === 0}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={nextPage}
          >
            <Text style={styles.navButtonText}>
              {currentPage === totalPages - 1 ? 'Take Test' : 'Next'}
            </Text>
            <ArrowRight size={16} color="white" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  pageContainer: {
    padding: 20,
    paddingBottom: 100, // Extra padding for navigation controls
  },
  pageTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#212121',
    marginBottom: 20,
  },
  imageContainer: {
    marginBottom: 24,
    borderRadius: 8,
    overflow: 'hidden',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: '#212121',
    marginBottom: 8,
  },
  sectionContent: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#424242',
    lineHeight: 24,
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButton: {
    backgroundColor: '#F5F7FA',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
  navButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#212121',
  },
});

export default ChapterScreen;
