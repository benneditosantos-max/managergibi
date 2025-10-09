#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional

class GabiCleaningAPITester:
    def __init__(self, base_url="https://gabimanager.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.admin_user = None
        self.helper_user = None
        self.client_user = None
        self.test_client_id = None
        self.test_helper_id = None
        self.test_job_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            self.failed_tests.append(f"{name}: {details}")
            print(f"❌ {name} - FAILED {details}")

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    expected_status: int = 200, use_auth: bool = True) -> tuple[bool, Dict]:
        """Make HTTP request with error handling"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if use_auth and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}

            return success, response_data

        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_root_endpoint(self):
        """Test basic API connectivity"""
        success, response = self.make_request('GET', '', use_auth=False)
        self.log_test("Root API Endpoint", success, 
                     f"Response: {response.get('message', 'No message')}")
        return success

    def test_user_registration(self):
        """Test user registration for different roles"""
        # Test admin registration
        admin_data = {
            "email": "admin@gabi.com",
            "password": "admin123",
            "name": "Admin User",
            "role": "admin",
            "phone": "+1234567890"
        }
        
        success, response = self.make_request('POST', 'auth/register', admin_data, 
                                            expected_status=200, use_auth=False)
        if success:
            self.admin_user = response.get('user')
            self.token = response.get('access_token')
        
        self.log_test("Admin Registration", success, 
                     f"User ID: {response.get('user', {}).get('id', 'N/A')}")

        # Test helper registration
        helper_data = {
            "email": "helper@gabi.com",
            "password": "helper123",
            "name": "Helper User",
            "role": "helper",
            "phone": "+1234567891",
            "hourly_rate": 25.0,
            "availability": "Mon-Fri 8AM-5PM"
        }
        
        success, response = self.make_request('POST', 'auth/register', helper_data, 
                                            expected_status=200, use_auth=False)
        if success:
            self.helper_user = response.get('user')
            self.test_helper_id = response.get('user', {}).get('id')
        
        self.log_test("Helper Registration", success, 
                     f"Helper ID: {response.get('user', {}).get('id', 'N/A')}")

        # Test client registration
        client_data = {
            "email": "client@gabi.com",
            "password": "client123",
            "name": "Client User",
            "role": "client",
            "phone": "+1234567892"
        }
        
        success, response = self.make_request('POST', 'auth/register', client_data, 
                                            expected_status=200, use_auth=False)
        if success:
            self.client_user = response.get('user')
        
        self.log_test("Client Registration", success, 
                     f"Client ID: {response.get('user', {}).get('id', 'N/A')}")

        return self.admin_user is not None

    def test_user_login(self):
        """Test user login"""
        login_data = {
            "email": "admin@gabi.com",
            "password": "admin123"
        }
        
        success, response = self.make_request('POST', 'auth/login', login_data, 
                                            expected_status=200, use_auth=False)
        if success:
            self.token = response.get('access_token')
            self.admin_user = response.get('user')
        
        self.log_test("Admin Login", success, 
                     f"Token received: {'Yes' if self.token else 'No'}")
        return success

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.make_request('GET', 'me')
        self.log_test("Get Current User", success, 
                     f"User: {response.get('name', 'N/A')}")
        return success

    def test_client_management(self):
        """Test client CRUD operations"""
        # Create client
        client_data = {
            "name": "Test Client",
            "phone": "+1555123456",
            "email": "testclient@example.com",
            "address": "123 Test Street, Test City, TC 12345",
            "notes": "Test client for API testing"
        }
        
        success, response = self.make_request('POST', 'clients', client_data, 
                                            expected_status=200)
        if success:
            self.test_client_id = response.get('id')
        
        self.log_test("Create Client", success, 
                     f"Client ID: {response.get('id', 'N/A')}")

        # Get all clients
        success, response = self.make_request('GET', 'clients')
        client_count = len(response) if isinstance(response, list) else 0
        self.log_test("Get All Clients", success, 
                     f"Found {client_count} clients")

        return self.test_client_id is not None

    def test_helper_management(self):
        """Test helper management"""
        success, response = self.make_request('GET', 'helpers')
        helper_count = len(response) if isinstance(response, list) else 0
        self.log_test("Get All Helpers", success, 
                     f"Found {helper_count} helpers")
        return success

    def test_job_management(self):
        """Test job CRUD operations"""
        if not self.test_client_id:
            self.log_test("Job Management", False, "No test client available")
            return False

        # Create job
        job_date = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        job_data = {
            "client_id": self.test_client_id,
            "date": job_date,
            "duration_hours": 3.0,
            "job_type": "regular",
            "price_charged": 150.0,
            "helper_id": self.test_helper_id,
            "notes": "Test cleaning job"
        }
        
        success, response = self.make_request('POST', 'jobs', job_data, 
                                            expected_status=200)
        if success:
            self.test_job_id = response.get('id')
        
        self.log_test("Create Job", success, 
                     f"Job ID: {response.get('id', 'N/A')}")

        # Get all jobs
        success, response = self.make_request('GET', 'jobs')
        job_count = len(response) if isinstance(response, list) else 0
        self.log_test("Get All Jobs", success, 
                     f"Found {job_count} jobs")

        # Update job status
        if self.test_job_id:
            update_data = {
                "status": "in_progress",
                "helper_payment": 75.0,
                "operational_cost": 10.0
            }
            
            success, response = self.make_request('PUT', f'jobs/{self.test_job_id}', 
                                                update_data)
            self.log_test("Update Job Status", success, 
                         f"Status updated to in_progress")

        return self.test_job_id is not None

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, response = self.make_request('GET', 'dashboard/stats')
        
        if success:
            stats = response
            details = f"Jobs today: {stats.get('total_jobs_today', 0)}, " \
                     f"Revenue: ${stats.get('total_revenue', 0):.2f}, " \
                     f"Profit: ${stats.get('net_profit', 0):.2f}"
        else:
            details = f"Error: {response.get('error', 'Unknown error')}"
        
        self.log_test("Dashboard Stats", success, details)
        return success

    def test_role_based_access(self):
        """Test role-based access control"""
        # Test helper login and access
        helper_login = {
            "email": "helper@gabi.com",
            "password": "helper123"
        }
        
        success, response = self.make_request('POST', 'auth/login', helper_login, 
                                            use_auth=False)
        if success:
            helper_token = response.get('access_token')
            # Temporarily switch to helper token
            original_token = self.token
            self.token = helper_token
            
            # Helper should NOT be able to create clients
            client_data = {
                "name": "Unauthorized Client",
                "address": "Should not work"
            }
            success, response = self.make_request('POST', 'clients', client_data, 
                                                expected_status=403)
            self.log_test("Helper Access Control (Create Client)", success, 
                         "Helper correctly denied client creation")
            
            # Helper should be able to view jobs
            success, response = self.make_request('GET', 'jobs')
            self.log_test("Helper Access Control (View Jobs)", success, 
                         "Helper can view jobs")
            
            # Restore admin token
            self.token = original_token
        
        return True

    def test_error_handling(self):
        """Test API error handling"""
        # Test invalid login
        invalid_login = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        success, response = self.make_request('POST', 'auth/login', invalid_login, 
                                            expected_status=400, use_auth=False)
        self.log_test("Invalid Login Handling", success, 
                     "Correctly rejected invalid credentials")

        # Test unauthorized access
        original_token = self.token
        self.token = "invalid_token"
        
        success, response = self.make_request('GET', 'me', expected_status=401)
        self.log_test("Unauthorized Access Handling", success, 
                     "Correctly rejected invalid token")
        
        self.token = original_token
        return True

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("🧪 Starting Gabi Cleaning Manager API Tests")
        print("=" * 60)
        
        # Basic connectivity
        if not self.test_root_endpoint():
            print("❌ Cannot connect to API. Stopping tests.")
            return False

        # Authentication tests
        self.test_user_registration()
        self.test_user_login()
        self.test_get_current_user()

        # Core functionality tests
        self.test_client_management()
        self.test_helper_management()
        self.test_job_management()
        self.test_dashboard_stats()

        # Security tests
        self.test_role_based_access()
        self.test_error_handling()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"  - {failure}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"\n🎯 Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80  # Consider 80%+ as passing

def main():
    """Main test execution"""
    tester = GabiCleaningAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except Exception as e:
        print(f"💥 Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())